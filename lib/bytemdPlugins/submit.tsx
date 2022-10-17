import type { BytemdPlugin } from 'bytemd';

export default function submitPlugin(onClick: () => void): BytemdPlugin {
  return {
    actions: [
      {
        title: '提交',
        icon: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1665415412862" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5502" xmlns:xlink="http://www.w3.org/1999/xlink" width="256" height="256"><path d="M385 840.5c-20.8 0-41.7-7.9-57.6-23.8L87.6 576.9c-31.8-31.8-31.8-83.3 0-115.1s83.3-31.8 115.1 0l239.8 239.8c31.8 31.8 31.8 83.3 0 115.1-15.9 15.9-36.7 23.8-57.5 23.8z" fill="#24292F" p-id="5503"></path><path d="M384.6 840.5c-20.8 0-41.7-7.9-57.6-23.8-31.8-31.8-31.8-83.3 0-115.1l494.2-494.2c31.8-31.8 83.3-31.8 115.1 0s31.8 83.3 0 115.1L442.2 816.7c-15.9 15.9-36.8 23.8-57.6 23.8z" fill="#24292F" p-id="5504"></path></svg>',
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
