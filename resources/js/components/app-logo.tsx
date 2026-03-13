import AppLogoIcon from './app-logo-icon';

// export default function AppLogo() {
//     return (
//         <div className="flex items-end">
//             <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
//                 <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
//             </div>
//             <div className="ml-1 flex-1 text-left text-sm hidden md:block ">
//                 <span className="mb-0.5 truncate leading-tight font-semibold font-logo tracking-widest">
//                     Clockra.
//                 </span>
//             </div>
//         </div>
//     );
// }
export default function AppLogo() {
    return (
        <div>
          <AppLogoIcon />
        </div>
    );
}