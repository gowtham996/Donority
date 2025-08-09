# Donority

A modern donation platform built with [Vite](https://vitejs.dev/) and [React](https://react.dev/).

## Features

- Fast and responsive UI
- Donation flows with INR (₹) support
- Social sharing (Open Graph & Twitter cards)
- Easy deployment to Vercel, Render, or other platforms

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

Clone the repository:

```sh
git clone https://github.com/yourusername/donority.git
cd donority
```

Install dependencies:

```sh
npm install
```

### Running Locally

Start the development server:

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Deployment

### Vercel

1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com), create a new project, and import your repo.
3. Vercel auto-detects Vite.  
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Click **Deploy**.

### Render

1. Push your code to GitHub.
2. Go to [Render](https://render.com), create a new Static Site.
   - Build Command: `npm run build`
   - Publish Directory: `dist`
3. Click **Create Static Site**.

## Configuration

- Currency is set to INR (₹) throughout the app.
- Update environment variables or API keys in `.env` as needed.

## Project Structure

```
donority/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   └── main.tsx
├── index.html
├── package.json
└── README.md
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

## License

[MIT](LICENSE)

---

**Made with ❤️ for a good cause.**
