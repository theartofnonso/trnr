# TRNR - AI Voice Conversation UI

A minimalist Next.js application showcasing a clean voice conversation interface with an AI personal trainer powered by OpenAI's Voice Agent API.

## Features

- Connect/disconnect button for AI agent
- Real-time voice conversation with OpenAI's Voice Agent (Realtime API)
- Personal trainer AI assistant
- Clean, minimalist design
- Configured prompt system for easy customization

## Prerequisites

- Node.js 18+ installed
- OpenAI API key with access to the Realtime API (gpt-4o-realtime-preview)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

**Important**: 
- Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Make sure your account has access to the Realtime API
- **Note**: Using `NEXT_PUBLIC_` exposes the key client-side. For production, use a backend route to generate ephemeral keys securely

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Click the circular Connect button in the center of the screen
2. Grant microphone permissions when prompted
3. Start speaking with your AI personal trainer
4. The agent will respond in real-time with voice
5. Click the button again to disconnect

## Customizing the Personal Trainer

Edit the prompt in `config/personalTrainerPrompt.ts` to customize:
- The trainer's personality and tone
- Instructions and behavior
- Communication style
- Any specific fitness coaching guidelines

## Architecture

- **Frontend**: Next.js 14 (App Router) with React hooks
- **Voice Agent**: Official OpenAI Agents SDK (`@openai/agents/realtime`)
- **Audio**: Handled automatically by the SDK (no manual audio processing needed)
- **Styling**: Tailwind CSS

## Project Structure

```
trnr/
├── app/
│   ├── page.tsx             # Main UI component
│   └── layout.tsx
├── config/
│   └── personalTrainerPrompt.ts  # AI prompt configuration
├── hooks/
│   └── useVoiceAgent.ts     # React hook using official SDK
└── lib/
    └── voiceAgent.ts       # RealtimeAgent configuration
```

## How It Works

1. **Client clicks Connect** → Generates ephemeral client secret directly from OpenAI API
2. **Creates agent and session** → Uses RealtimeAgent and RealtimeSession from SDK
3. **SDK handles everything** → Microphone access, WebRTC connection, audio streaming
4. **Real-time conversation** → Voice input/output handled automatically by SDK
5. **Click Disconnect** → SDK automatically cleans up all connections and resources

**Note**: This implementation uses `NEXT_PUBLIC_OPENAI_API_KEY` which exposes the key client-side. For production applications, you should use a backend route to generate ephemeral keys securely.

## Key Benefits of Using Official SDK

- ✅ **Simplified code**: No manual WebSocket or audio processing, no backend routes needed
- ✅ **Direct implementation**: Follows OpenAI's quickstart guide exactly
- ✅ **Automatic handling**: SDK manages all audio streaming and connections
- ✅ **Event-driven**: Clean event listeners for connection state
- ✅ **Built-in features**: Turn detection, interruptions, WebRTC, etc.

## Troubleshooting

- **Microphone not working**: Ensure you've granted browser permissions
- **Connection errors**: Check that your OpenAI API key is valid and has Realtime API access
- **Audio issues**: Use Chrome or Edge for best compatibility (WebSocket and Web Audio API support)

## License

MIT

