import AppLogo from '@/components/app-logo';
import KeenIcon from '@/components/keen-icon';
import { Link } from '@inertiajs/react';

const Footer = () => {
    return (
        <footer className="relative mt-16 overflow-hidden border-t bg-white dark:bg-gray-900">
            <img
                alt=""
                src="/assets/illustrations/group.svg"
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-auto max-w-none -translate-x-1/2 object-contain"
                style={{ width: 'min(1800px, 140vw)' }}
            />

            <div className="relative z-10 w-full px-4 pt-16 pb-44 sm:px-6 sm:pb-52 lg:px-8 lg:pb-60">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Column 1: Logo, description, and social icons together */}
                    <div className="col-span-2 flex flex-col items-center text-center lg:items-start lg:text-left">
                        <AppLogo />
                        <p className="mt-4 max-w-xl text-gray-500 lg:text-lg dark:text-gray-400">
                            Discover local service providers near your location
                            with proxideck. Browse trusted professionals, view
                            service offerings, ratings, and book your next
                            appointment with ease. Find the right expert for
                            your needs quickly and securely.
                        </p>
                        <div className="mt-6 flex justify-center gap-4 lg:justify-start">
                            <a
                                className="font-heading text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                href="#"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className="sr-only">Facebook</span>
                                <KeenIcon name="facebook" className="!text-xl"/>
                            </a>
                            <a
                                className="font-heading text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                href="#"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className="sr-only">Instagram</span>
                                <KeenIcon name="instagram" className="!text-xl"/>
                            </a>
                            <a
                                className="font-heading text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                href="#"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className="sr-only">Twitter</span>
                              <KeenIcon name="twitter" className="!text-xl"/>
                            </a>
                            <a
                                className="font-heading text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                href="#"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className="sr-only">GitHub</span>
                                 <KeenIcon name="tiktok" className="!text-xl"/>
                            </a>
                            <a
                                className="font-heading text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                href="#"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className="sr-only">Dribbble</span>
                                <KeenIcon name="youtube" className="!text-xl"/>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Link groups */}
                    <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-3 sm:text-left">
                        <div>
                            <strong className="font-heading text-lg font-bold text-gray-900 dark:text-white">
                                Proxideck
                            </strong>
                            <ul className="mt-3 space-y-3">
                                <li>
                                    <Link
                                        href="/about"
                                        className="font-heading text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                    >
                                        About
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        href="/history"
                                        className="font-heading text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                    >
                                        History
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/our-team"
                                        className="font-heading text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                    >
                                        Our Team
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <strong className="font-heading text-lg font-bold text-gray-900 dark:text-white">
                                Support
                            </strong>
                            <ul className="mt-3 space-y-3">
                                <li>
                                    <Link
                                        href="/faqs"
                                        className="font-heading text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                    >
                                        FAQs
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/contact"
                                        className="font-heading text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                    >
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <strong className="font-heading text-lg font-bold text-gray-900 dark:text-white">
                                Legal
                            </strong>
                            <ul className="mt-3 space-y-3">
                                <li>
                                    <Link
                                        href="/privacy-policy"
                                        className="font-heading text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                    >
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/terms"
                                        className="font-heading text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                    >
                                        Terms and Conditions
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
