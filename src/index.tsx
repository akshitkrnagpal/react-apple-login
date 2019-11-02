import React, { useEffect } from 'react';

export interface AppleLoginProps {
  clientId: string;
  redirectURI: string;
  scope?: string;
  state?: string;
  responseType?: string | 'code' | 'id_token';
  responseMode?: string | 'query' | 'fragment' | 'form_post';
  nonce?: string;
  designProp?: {
    // REF: https://developer.apple.com/documentation/signinwithapplejs/incorporating_sign_in_with_apple_into_other_platforms
    height?: number;
    width?: number;
    color?: string | 'white' | 'black';
    border?: boolean;
    type?: string | 'sign-in' | 'continue';
    border_radius?: number;
    scale?: number;
    locale?: string;
  }
  callback?: (d: any) => void;
  render?: (props: { onClick: (e?: any) => void, disabled?: boolean }) => JSX.Element;
}

const generateQueryString = (q: any) => {
  let queryString = '';
  if (q) {
    const queryKeys = Object.keys(q);
    queryKeys.forEach(key => {
      if (q[key]) {
        if (q[key].toString().length) {
          queryString += `${key}=${q[key]}&`;
        }
      }
    });
    if (queryKeys.length > 0 && queryString[queryString.length - 1] === '&') {
      queryString = queryString.slice(0, -1);
    }
  }
  return queryString;
};

const AppleLogin = (props: AppleLoginProps) => {
  const { clientId, redirectURI, state = '', render, designProp = {}, responseMode = 'query', responseType = 'code', nonce, callback, scope } = props;

  useEffect(() => {
    if (typeof callback === 'function' && responseMode === 'query' && responseType === 'code' && window && window.location) {
      let match;
      const pl = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = (s: any) => { return decodeURIComponent(s.replace(pl, " ")); },
        query = window.location.search.substring(1);

      let urlParams = {};
      while (match = search.exec(query)) {
        urlParams[decode(match[1])] = decode(match[2]);
      }
      if (urlParams['code']) {
        callback({
          code: urlParams['code']
        });
      }
    }
    return () => {
    };
  }, [])

  const onClick = (e: any) => {
    if (e) {
      e.preventDefault();
    }
    window.location.href = `https://appleid.apple.com/auth/authorize?${generateQueryString({
      response_type: responseType,
      response_mode: responseMode,
      client_id: clientId,
      redirect_uri: encodeURIComponent(redirectURI),
      state,
      nonce,
      scope: responseMode === 'query' ? '' : scope
    })}`;
  }

  if (typeof render === 'function') {
    return render({ onClick })
  }

  return (
    <>
      <div onClick={onClick}>
        <img src={`https://appleid.cdn-apple.com/appleid/button?${generateQueryString(designProp)}`} />
      </div>
    </>
  );
};

export default AppleLogin;
