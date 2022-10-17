import type { BytemdPlugin } from 'bytemd';

export default function goBackPlugin(onClick: () => void): BytemdPlugin {
  return {
    actions: [
      {
        title: '返回',
        icon: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1665415990201" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6509" xmlns:xlink="http://www.w3.org/1999/xlink" width="256" height="256"><path d="M627.479 283.894H451.324V137.536l-385.13 196.73 385.13 196.68V384.639H641.56c150.323 0 225.485 64.75 225.485 194.3 0 134.36-77.542 199.111-234.856 199.111H190.636v103.174h448.592c211.356 0 319.389-98.365 319.389-292.666 0-203.919-110.362-304.664-331.138-304.664z" p-id="6510" fill="#24292F"></path></svg>',
        handler: {
          type: 'action',
          click(ctx) {
            onClick();
          },
        },
      },
    ],
  };
}
