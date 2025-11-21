// Set Cookie 함수
export default class Cookie {
  static set = (name: string, value: string, days: number | undefined)=>{
      let expires = "";
      if (days) {
          const date = new Date();
          date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
          expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + value + expires + "; path=/";
  }

  static get = (name: string)=>{
      const cookieName = name + "=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(';');

      for(let i = 0; i < cookieArray.length; i++) {
          let cookie = cookieArray[i];
          while (cookie.charAt(0) === ' ') {
              cookie = cookie.substring(1);
          }
          if (cookie.indexOf(cookieName) === 0) {
              return cookie.substring(cookieName.length, cookie.length);
          }
      }
      return null;
  }

  static remove = (name: string)=>{
      Cookie.set(name,"",-1);
  }
}

