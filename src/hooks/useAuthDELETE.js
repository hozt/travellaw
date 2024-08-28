// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editorUrl, setEditorUrl] = useState('');

  useEffect(() => {
    const checkLoginStatus = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const editorKey = 'YOUR_EDITOR_KEY'; // Replace with actual key or fetch from environment

      if (urlParams.has("editor")) {
        const passedEditorKey = urlParams.get("editor");
        if (passedEditorKey === editorKey) {
          Cookies.set("isEditor", passedEditorKey, { expires: 1, path: "/" });
          setIsLoggedIn(true);
        }
      } else {
        const editorCookie = Cookies.get("isEditor");
        if (editorCookie === editorKey) {
          setIsLoggedIn(true);
        }
      }

      setEditorUrl(`${window.location.origin}/wp-admin/`);
    };

    checkLoginStatus();
  }, []);

  return { isLoggedIn, editorUrl };
}
