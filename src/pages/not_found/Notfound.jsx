import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsAnimated(true);
        }, 100);
    }, []);

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 md:p-6">
            <div className={`max-w-lg w-full transition-all duration-1000 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Graphic Element with proper colors */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-[#249B73]/20 rounded-full blur-xl transform -translate-x-1/4 -translate-y-1/4"></div>
                        <div className="relative bg-[#249B73] p-5 rounded-full shadow-lg">
                            <Search size={52} className="text-[#F9FAFB]" />
                        </div>
                    </div>
                </div>

                {/* Text Content with proper colors */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#249B73] mb-3">Sahifa topilmadi</h1>
                    <p className="text-base md:text-lg text-[#249B73]/70 mb-6">
                        Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan
                    </p>
                </div>

                {/* Buttons with all proper colors */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to={-1}
                        className="flex items-center justify-center gap-2 px-6 py-3 text-[#249B73] bg-[#F9FAFB] border border-[#249B73]/30 rounded-lg shadow-md hover:bg-[#F9FAFB] hover:border-[#249B73] transition-all duration-300 w-full sm:w-auto"
                    >
                        <ArrowLeft size={20} className="text-[#249B73]" />
                        <span className="font-medium">Orqaga</span>
                    </Link>

                    <Link
                        to={"/"}
                        className="flex items-center justify-center gap-2 px-6 py-3 text-[#F9FAFB] bg-[#249B73] rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
                    >
                        <Home size={20} />
                        <span className="font-medium">Bosh sahifa</span>
                    </Link>
                </div>

                {/* Decorative elements using the brand colors */}
                <div className="relative mt-16">
                    <div className="absolute left-0 top-1/2 h-px w-1/3 bg-gradient-to-r from-transparent to-[#249B73]/30"></div>
                    <div className="absolute right-0 top-1/2 h-px w-1/3 bg-gradient-to-l from-transparent to-[#249B73]/30"></div>
                    <div className="text-center text-[#249B73]/60 text-sm px-4">
                        Saytimizga qaytish uchun yuqoridagi tugmalardan foydalaning
                    </div>
                </div>
            </div>

            {/* Bottom decorative element */}
            <div className="fixed bottom-0 w-full h-1 bg-gradient-to-r from-[#F9FAFB] to-[#249B73]"></div>
        </div>
    );
}