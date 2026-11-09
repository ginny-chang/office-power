// Applies the account's 外觀主題 to every page as <html data-theme="…">; tokens.css holds each theme's colors.
const settingsKey='office-account-settings-v1',changed='office-account-settings-changed';
export const defaultTheme='soft-light';
function theme(){try{return JSON.parse(localStorage.getItem(settingsKey)||'{}').theme||defaultTheme}catch{return defaultTheme}}
function apply(){const value=theme();if(value===defaultTheme)delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=value}
apply();
window.addEventListener(changed,apply);
window.addEventListener('storage',event=>{if(event.key===settingsKey)apply()});
