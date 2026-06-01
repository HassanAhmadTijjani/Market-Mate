// @ts-nocheck
import { Link } from 'react-router-dom'
import useSettings from '../../hooks/useSettings'

function Footer() {
    const { settings } = useSettings()
    return (
        <footer className="bg-blue-900 text-white">
            <div className="max-w-6xl mx-auto px-6 py-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-md flex items-center justify-center text-white font-bold text-sm bg-primary">
                                MM
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white leading-none">
                                    {settings?.store_name}
                                </p>
                                <p className="text-xs text-primary leading-none mt-1 tracking-widest">
                                    Home of Accessories
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            The best online shopping place for all kind of gadget and accessories.
                        </p>
                        <div className="flex gap-3 mt-6">
                            {['M', 'A', 'T', 'E'].map((s) => (
                                <div key={s}
                                    className="w-9 h-9 rounded-lg bg-brand-charcoal flex items-center justify-center text-gray-400 text-xs font-bold hover:bg-primary hover:text-white transition-all cursor-pointer">
                                    {s}
                                </div>
                            ))}

                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">
                            Pages
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link to="/" className="text-gray-400 text-sm hover:text-white no-underline transition-colors">
                                Home
                            </Link>
                            <Link to="/about" className="text-gray-400 text-sm hover:text-white no-underline transition-colors">
                                About
                            </Link>
                            <Link to="/shop" className="text-gray-400 text-sm hover:text-white no-underline transition-colors">
                                Shop
                            </Link>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">
                            Legal
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link to="/privacy-policy" className="text-gray-400 text-sm hover:text-white no-underline transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms-conditions" className="text-gray-400 text-sm hover:text-white no-underline transition-colors">
                                Terms of Use
                            </Link>
                            <Link to="/about" className="text-gray-400 text-sm hover:text-white no-underline transition-colors">
                                Contact Us
                            </Link>
                        </div>
                    </div>

                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-white text-xs">
                        © 2026 {settings?.store_name}. All rights reserved.
                    </p>
                    <a
                        href="https://wa.me/2348143128855?text=Hello%20Innovators%20Hub,%20I%20saw%20the%20MarketMate%20system%20and%20I%20want%20something%20similar."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 hover:text-primary transition border-l border-primary pl-2   p-2 rounded-sm"
                    >
                        Built by Innovator Hub
                    </a>                </div>

            </div>

        </footer>
    )
}

export default Footer