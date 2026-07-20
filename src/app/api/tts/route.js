// Free TTS using Google Translate API without dependencies
export async function POST(request) {
  try {
    const { text, language } = await request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lang = language === 'en' ? 'en' : 'id';
    
    // Use Google Translate's public TTS API
    // This is the same endpoint used by translate.google.com for speech synthesis
    const url = new URL('https://translate.google.com/translate_a/element.js');
    url.searchParams.append('cb', 'gttsCallBack');

    // Alternative: Use a simple fetch to get audio from Google's TTS
    // The audio URL format: https://translate.google.com/translate_tts?...
    const ttsUrl = new URL('https://translate.google.com/translate_tts');
    ttsUrl.searchParams.append('client', 'gtx');
    ttsUrl.searchParams.append('sl', lang);
    ttsUrl.searchParams.append('tl', lang);
    ttsUrl.searchParams.append('dt', 'audio');
    ttsUrl.searchParams.append('q', text);
    
    // Fetch the audio file
    const audioResponse = await fetch(ttsUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
      },
    });

    if (!audioResponse.ok) {
      throw new Error(`TTS API returned ${audioResponse.status}: ${audioResponse.statusText}`);
    }

    // Get audio as buffer
    const audioBuffer = await audioResponse.arrayBuffer();
    
    // Convert to base64
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return new Response(JSON.stringify({
      audio: base64Audio,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('TTS Error:', error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate speech. Trying again may help.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
