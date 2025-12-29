import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-[#1a1f2e] text-white border-t border-slate-700/50 transition-colors duration-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-xl font-bold mb-4">SkillHive</h3>
                        <p className="text-slate-400 text-sm leading-relaxed transition-colors">
                            Empowering students with AI-driven adaptive learning paths for a smarter future.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-white/90">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-400 transition-colors">
                            <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">How it Works</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-white/90">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-400 transition-colors">
                            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-white/90">Connect</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                                <Github size={20} />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                                <Linkedin size={20} />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                        <div className="mt-6">
                            <p className="text-xs text-slate-500">
                                © {new Date().getFullYear()} SkillHive AI. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
