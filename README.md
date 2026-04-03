# Create Calendar Event for Shindo Ramen Reservation

[Shindo Ramen](https://maps.app.goo.gl/M1ECt6TLt2BMG7ot7) is a ramen restaurant in Thailand. The reservation is made by phone only (or walk-in and test your luck). As a frequent customer, I make this to simplify my life a bit.

Behold a calendar event generator for [Shindo Ramen](https://maps.app.goo.gl/M1ECt6TLt2BMG7ot7) reservation. Users choose their reservation date, time, and pin their preferred parking location, then download an `.ics` file to add their booking to their calendar.

<img src="https://github.com/user-attachments/assets/96ff3091-17db-4bde-9c0a-c8a5eadc6866" width=30% height=30%>

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv@0.13.2 create --template minimal --types ts --add prettier vitest="usages:unit,component" tailwindcss="plugins:typography,forms" --install pnpm shindo-calendar
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
