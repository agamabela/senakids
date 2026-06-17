// Google Cloud Text-to-Speech API
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Initialize client - will use GOOGLE_APPLICATION_CREDENTIALS env var
const ttsClient = new TextToSpeechClient();

export async function POST(request) {
  try {
    const { text, language } = await request.json();

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    // Select voice based on language
    let voiceName, ssmlGender;

    if (language === 'id') {
      // Indonesian Neural2 voice - natural sounding
      voiceName = 'id-ID-Neural2-C';
    } else {
      // English US Neural2 voice
      voiceName = 'en-US-Neural2-C';
    }

    // Construct the request
    const request_ = {
      input: { text: text },
      // Select the voice
      voice: {
        languageCode: language === 'id' ? 'id-ID' : 'en-US',
        name: voiceName,
        ssmlGender: 'NEUTRAL',
      },
      // select the type of audio encoding
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.85, // Slightly slower for kids
        pitch: 0, // Default pitch
      },
    };

    // Performs the text-to-speech request
    const [response] = await ttsClient.synthesizeSpeech(request_);

    if (!response.audioContent) {
      throw new Error('No audio content returned');
    }

    // Convert Buffer to base64
    const base64Audio = Buffer.from(response.audioContent).toString('base64');

    return Response.json({
      audio: base64Audio,
    });

  } catch (error) {
    console.error('TTS Error:', error.message);
    return Response.json({
      error: error.message,
      details: 'Failed to generate speech'
    }, { status: 500 });
  }
}