# Password Wallet

A simple password wallet UI built from the [Figma design](https://www.figma.com/design/w45tZVbgZUE5oBgVAz5UmF/Password-wallet?node-id=1-2).

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx --yes serve .
```

## Features

- 4×4 grid of service shortcuts matching the design
- **Multiple users** — switch users from the dropdown; each user has their own credentials per service
- Click any icon to save username, password, and notes (stored in `localStorage`)
- Green dot on icons that have saved credentials for the **active user**
- Add users (`+`), rename or delete users (`⋯` manage dialog)

## Stack

- Plain HTML, CSS, and JavaScript (no build step)
- [Jersey 10](https://fonts.google.com/specimen/Jersey+10) for the pixel title font
