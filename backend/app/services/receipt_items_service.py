from app.repositories import (
    items_participants_repository,
    receipt_items_repository,
)

from app.schemas.receipts import FullReceiptItemCreate
from app.services.receipt_validators import (
    check_missing_and_return_error,
    validate_unique,
)

def create_or_update_item(connection,receipt_id,item_data,participants):

    """
    Создаёт или обновляет позицию чека и распределяет её сумму.

    Если список участников позиции пуст, сумма распределяется между
    участниками, переданными в параметре participants. При обновлении
    старые связи позиции с участниками заменяются новыми.

    :param connection: соединение с базой данных.
    :param receipt_id: идентификатор чека.
    :param item_data: данные создаваемой или обновляемой позиции.
    :param participants: участники для распределения по умолчанию.
    :return: данные позиции и созданные связи с участниками.
    """


    if item_data.participants:
        split_participants = item_data.participants
    else:
        split_participants = participants

    share_amount = round(
        float(item_data.unit_price * item_data.quantity)/len(split_participants),
        2,
    )


    
    if item_data.id is None:
        receipt_item = receipt_items_repository.create(
            connection=connection,
            receipt_id=receipt_id,
            title=item_data.title,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
        )
        
        
        item_participants = (
            items_participants_repository.create(
                connection=connection,
                receipt_item_id=receipt_item["id"],
                participants=split_participants,
                share_amount=share_amount,
            )
        )
    else:
        receipt_item = receipt_items_repository.update(
            connection=connection,
            receipt_id=receipt_id,
            item_id=item_data.id,
            title=item_data.title,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
        )

        item_participants = (
            items_participants_repository.replace_for_item(
                connection=connection,
                receipt_item_id=item_data.id,
                participants=split_participants,
                share_amount=share_amount,
            )
        )

    return receipt_item, item_participants


def sync_receipt_items(connection,items,existing_items,receipt_id,
                 total_amount,participants):

    """
    Синхронизирует позиции и связи указанного чека.

    Удаляет позиции, отсутствующие во входных данных, обновляет существующие
    и создаёт новые. Если позиции не переданы, создаёт одну фиктивную
    позицию на полную сумму чека.

    :param connection: соединение с базой данных.
    :param items: новые данные позиций или None.
    :param existing_items: идентификаторы существующих позиций чека.
    :param receipt_id: идентификатор чека.
    :param total_amount: итоговая сумма чека.
    :param participants: участники для распределения по умолчанию.
    :return: список созданных или обновлённых позиций со связями.
    """

    if items is None:
        receipt_items_repository.delete_by_ids(
            connection,
            receipt_id,
            list(existing_items),
        )

        fake_item = FullReceiptItemCreate(
            title="Общая сумма",
            quantity=1,
            unit_price=total_amount,
            participants=[],
        )

        receipt_item, item_participants = (
            create_or_update_item(
                connection=connection,
                receipt_id=receipt_id,
                item_data=fake_item,
                participants=participants,
            )
        )

        result_items = [
            {
                "item": receipt_item,
                "participants": item_participants,
            }
        ]

    else:
        incoming_items = [
            item.id
            for item in items
            if item.id is not None
        ]

        validate_unique(incoming_items,"","ID позиций не должны повторяться")
        unique_items = set(incoming_items)

        check_missing_and_return_error(unique_items,existing_items,
            "Некоторые позиции не принадлежат чеку")

        deleted_item = (
            existing_items - unique_items
        )

        receipt_items_repository.delete_by_ids(
            connection,
            receipt_id,
            list(deleted_item),
        )

        result_items = []

        for item_data in items:
            receipt_item,item_participants = create_or_update_item(connection,receipt_id,item_data,participants)

            result_items.append(
                {
                    "item": receipt_item,
                    "participants": item_participants,
                }
            )

    return result_items


def update_after_delete_participant(
    connection,
    meeting_id: int,
    participant_id: int,
):

    """
    Перераспределяет суммы позиций после удаления участника.

    Находит все позиции указанной встречи, связанные с удаляемым
    участником, и удаляет его связи с ними. Если у позиции остаются
    другие участники, полная стоимость позиции поровну распределяется
    между ними.

    Если удаляемый участник был единственным участником позиции,
    позиция остаётся без связей. При делении сумма доли округляется
    до двух знаков после запятой, поэтому возможно расхождение
    итоговой распределённой суммы на несколько копеек.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param participant_id: идентификатор удаляемого участника.
    :return: список обновлённых связей участников с позициями.
    """
    
    items = (
        items_participants_repository
        .get_items_by_participant(
            connection=connection,
            meeting_id=meeting_id,
            participant_id=participant_id,
        )
    )

    prepared_items = []

    for item in items:
        participant_ids = (
            items_participants_repository
            .get_participant_ids_except(
                connection=connection,
                receipt_item_id=item["receipt_item_id"],
                excluded_participant_id=participant_id,
            )
        )

        prepared_items.append({
            **item,
            "participant_ids": participant_ids,
        })

    updated_links = []

    for item in prepared_items:
        receipt_item_id = item["receipt_item_id"]
        participant_ids = item["participant_ids"]

        items_participants_repository.delete_participant_link(
            connection=connection,
            receipt_item_id=receipt_item_id,
            participant_id=participant_id,
        )

        if not participant_ids:
            continue
        
        total_amount = float(item["unit_price"]) * float(item["quantity"])

        participants_count = len(participant_ids)

        share_amount = round(
            total_amount / participants_count , 2
        )
        
        values = []

        for remaining_participant_id in participant_ids:

            values.append({
                "receipt_item_id": receipt_item_id,
                "participant_id": remaining_participant_id,
                "share_amount": float(share_amount),
            })

        items_participants_repository.update_share_amounts(
            connection=connection,
            values=values,
        )

        updated_links.extend(values)

    return updated_links