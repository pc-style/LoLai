# LoL AI Assistant

A League of Legends AI assistant chat application built with Next.js, ShadCN UI components, and Google Gemini API.

## Features

- Modern, clean UI with a black and orange-yellow theme inspired by League of Legends
- Powered by Google Gemini 2.5 Flash for AI responses
- Responsive chat interface
- Dark mode by default

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/lol-ai.git
cd lol-ai
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up your environment:

```bash
# Run the interactive setup script
npm run setup
```

This will create a `.env.local` file with your Gemini API key. You can also manually create this file with the following content:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Keys

- Google Gemini API keys can be obtained from [Google AI Studio](https://ai.google.dev/)

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [ShadCN UI](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Google Gemini API](https://ai.google.dev/) - AI provider


##TODO
- add riot api integration
- annoucement of a desktop app
- live match api (grabbing the oponents picks)

## License

This project is licensed under the MIT License - see the LICENSE file for details.



