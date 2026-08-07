export default function ReceiptsTab() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <h3 className="font-bold text-lg text-center">Список чеков</h3>

            <div className="border-2 border-black p-3 flex justify-between items-center">
                <div>
                    <p className="font-bold">Ресторанчик "У Копатыча"</p>
                    <p className="text-xs text-gray-500">07.08.2026</p>
                </div>
                <p className="font-bold">2500 ₽</p>
            </div>
            <div className="border-2 border-black p-3 flex justify-between items-center">
                <div>
                    <p className="font-bold">Такси "#ВЛЕС"</p>
                    <p className="text-xs text-gray-500">07.08.2026</p>
                </div>
                <p className="font-bold">700 ₽</p>
            </div>
        </div>
    );
}
