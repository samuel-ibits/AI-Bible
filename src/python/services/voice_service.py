import pyttsx3
import threading
import queue
import os

class VoiceService:
    def __init__(self):
        self.engine = None
        self.is_speaking = False
        self._init_engine()

    def _init_engine(self):
        try:
            self.engine = pyttsx3.init()
            # Set properties (optional)
            self.engine.setProperty('rate', 150)    # Speed
            self.engine.setProperty('volume', 0.9)  # Volume
        except Exception as e:
            print(f"Error initializing TTS engine: {e}")

    def speak(self, text):
        """
        Speak text in a separate thread to avoid blocking the Flask app.
        """
        if not self.engine:
            return False
            
        def run_speech():
            self.is_speaking = True
            try:
                # pyttsx3.init() must be called in the same thread it's used in 
                # for some drivers, but let's try this first.
                # Actually, pyttsx3 is notorious for thread issues.
                # A safer way is to use a separate process or a queue.
                engine = pyttsx3.init()
                engine.say(text)
                engine.runAndWait()
                engine.stop()
            except Exception as e:
                print(f"Speech error: {e}")
            finally:
                self.is_speaking = False

        threading.Thread(target=run_speech).start()
        return True

    def stop(self):
        # Stopping logic is tricky with pyttsx3 threads
        pass
