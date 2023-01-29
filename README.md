## About

Version 2.0, Code 4 Tomorrow Info Website.

## Running Website

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## To develop the notion courses page on our website

1. You first need to build the project using ```npm run build``` once.
2. Then you can use ```npm run dev``` to develop the project like normal

This is necessary because when you build the project, the project queries all the different notion page ids and maps them to some slug and caches all of that in the ```.next``` folder. This helps with live mapping of notion page ids to human-readable urls during development.