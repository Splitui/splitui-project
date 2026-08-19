import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FourthSlide() {
    return (
        <div className="flex flex-col justify-start items-center text-center w-full h-full bg-[#EAE0CD] py-6 px-2 rounded-2xl">
            <div data-swiper-parallax="-200" className="mb-7">
                <h4 className="font-bold text-3xl text-[#463628]">FAQ</h4>
            </div>
            <div
                data-swiper-parallax="-100"
                className="w-full flex flex-col gap-2 overflow-y-auto"
                style={{ maxHeight: 'calc(100% - 80px)' }}
            >
                <Accordion
                    className="bg-[#F8F4EC] rounded-xl"
                    disableGutters
                    elevation={0}
                    sx={{
                        borderRadius: '12px !important',
                        '&:before': { display: 'none' },
                        color: '#463628',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: '#463628' }} />}
                    >
                        <p>Нужна ли регистрация?</p>
                    </AccordionSummary>
                    <AccordionDetails className="border-t border-[#EAE0CD]">
                        <p className="text-left opacity-70">
                            Нет, всё работает без аккаунта.
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    className="bg-[#F8F4EC] rounded-xl"
                    disableGutters
                    elevation={0}
                    sx={{
                        borderRadius: '12px !important',
                        '&:before': { display: 'none' },
                        color: '#463628',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: '#463628' }} />}
                    >
                        <p>Как пригласить друзей?</p>
                    </AccordionSummary>
                    <AccordionDetails className="border-t border-[#EAE0CD]">
                        <p className="text-left opacity-70">
                            Отправить ссылку, показать qr или назвать id номер.
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    className="bg-[#F8F4EC] rounded-xl"
                    disableGutters
                    elevation={0}
                    sx={{
                        borderRadius: '12px !important',
                        '&:before': { display: 'none' },
                        color: '#463628',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: '#463628' }} />}
                    >
                        <p>Что если чек не распознан?</p>
                    </AccordionSummary>
                    <AccordionDetails className="border-t border-[#EAE0CD]">
                        <p className="text-left opacity-70">
                            Есть возможность ввести чек вручную.
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    className="bg-[#F8F4EC] rounded-xl"
                    disableGutters
                    elevation={0}
                    sx={{
                        borderRadius: '12px !important',
                        '&:before': { display: 'none' },
                        color: '#463628',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: '#463628' }} />}
                    >
                        <p>Кто видит номер моей карты?</p>
                    </AccordionSummary>
                    <AccordionDetails className="border-t border-[#EAE0CD]">
                        <p className="text-left opacity-70">
                            Только участники вашей комнаты; автоматически он никому не
                            передаётся.
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    className="bg-[#F8F4EC] rounded-xl"
                    disableGutters
                    elevation={0}
                    sx={{
                        borderRadius: '12px !important',
                        '&:before': { display: 'none' },
                        color: '#463628',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: '#463628' }} />}
                    >
                        <p>Можно ли исправить после завершения?</p>
                    </AccordionSummary>
                    <AccordionDetails className="border-t border-[#EAE0CD]">
                        <p className="text-left opacity-70">
                            Да, создатель открывает “корректировку”, изменения логируются.
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    className="bg-[#F8F4EC] rounded-xl"
                    disableGutters
                    elevation={0}
                    sx={{
                        borderRadius: '12px !important',
                        '&:before': { display: 'none' },
                        color: '#463628',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: '#463628' }} />}
                    >
                        <p>Это бесплатно?</p>
                    </AccordionSummary>
                    <AccordionDetails className="border-t border-[#EAE0CD]">
                        <p className="text-left opacity-70">
                            Да, все функции сайта - совершенно бесплатные.
                        </p>
                    </AccordionDetails>
                </Accordion>
            </div>
        </div>
    );
}
