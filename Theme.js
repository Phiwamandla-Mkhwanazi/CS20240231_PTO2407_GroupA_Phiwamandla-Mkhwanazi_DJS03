class Theme {
    constructor() {
        this.settingsTheme = document.querySelector('[data-settings-theme]');
        this.settingsForm = document.querySelector('[data-settings-form]');
    }

    // Apply the theme based on user selection
    applyTheme(theme) {
        if (theme === 'night') {
            document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
            document.documentElement.style.setProperty('--color-light', '10, 10, 20');
        } else {
            document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
            document.documentElement.style.setProperty('--color-light', '255, 255, 255');
        }
    }

    // Event listener to handle theme changes from the form
    handleThemeChange(event) {
        event.preventDefault();
        const formData = new FormData(this.settingsForm);
        const { theme } = Object.fromEntries(formData);
        this.applyTheme(theme);
    }
}
