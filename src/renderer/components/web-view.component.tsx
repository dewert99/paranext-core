import { useRef } from 'react';
import {
  SavedTabInfo,
  TabInfo,
  WebViewContentType,
  WebViewContents,
  WebViewContentsSerialized,
  WebViewProps,
} from '@shared/data/web-view.model';
import { saveTabInfoBase } from '@shared/services/web-view.service';

export const TAB_TYPE_WEBVIEW = 'webView';

export function getTitle({ webViewType, title, contentType }: Partial<WebViewProps>): string {
  return title || `${webViewType || contentType} Web View`;
}

export function WebView({ webViewType, content, title, contentType }: WebViewProps) {
  // This ref will always be defined
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const iframeRef = useRef<HTMLIFrameElement>(null!);

  // TODO: We may be catching iframe exceptions moving forward by posting messages from the child
  // iframe to the parent, so it might be good to figure out how it works to add and remove a
  // handler of some sort. Maybe the post message handler can more easily handle this kind of
  // situation, though. We just don't want to leak memory by leaving an event handler on an iframe
  // when it gets removed (if that does leak memory).

  return (
    <iframe
      ref={iframeRef}
      title={getTitle({ webViewType, title, contentType })}
      // TODO: csp?
      // TODO: credentialless?
      // TODO: referrerpolicy?
      /**
       * Sandbox attribute for the webview - controls what resources scripts and other things can access.
       *
       * DO NOT CHANGE THIS WITHOUT A SERIOUS REASON
       */
      // allow-same-origin so the iframe can get papi and communicate and such
      // allow-scripts so the iframe can actually do things
      // allow-pointer-lock so the iframe can lock the pointer as desired
      // Note: Mozilla's iframe page 'allow-same-origin' and 'allow-scripts' warns that listing both of these
      // allows the child scripts to remove this sandbox attribute from the iframe. This means the
      // sandboxing will do nothing for a determined hacker. We must distrust the whole renderer due
      // to this issue. We will probably want to stay vigilant on security in this area.
      sandbox="allow-same-origin allow-scripts allow-pointer-lock"
      srcDoc={content}
    />
  );
}

export default function loadWebViewPanel(savedTabInfo: SavedTabInfo): TabInfo {
  if (!savedTabInfo.id) throw new Error('"id" is missing.');

  let data: WebViewProps;
  if (savedTabInfo.data) {
    // We need to make sure that the data is of the correct type
    data = savedTabInfo.data as WebViewProps;
  } else {
    // placeholder data
    data = {
      id: savedTabInfo.id,
      webViewType: 'Unknown',
      title: 'Unknown',
      content: '',
      contentType: WebViewContentType.HTML,
    };
  }

  return {
    ...savedTabInfo,
    title: data.title ?? 'Unknown',
    content: <WebView {...data} />,
  };
}

export function saveWebViewPanel(tabInfo: TabInfo): SavedTabInfo {
  const data = { ...(tabInfo.data as WebViewContentsSerialized) };
  // We don't want to keep the webView content so the extension can provide it
  delete (data as Omit<WebViewContents, 'content'> & Partial<Pick<WebViewContents, 'content'>>)
    .content;
  return { ...saveTabInfoBase(tabInfo), data };
}
