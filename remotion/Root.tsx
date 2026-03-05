import React from 'react';
import { Composition } from 'remotion';
import { GameCaption } from './GameCaption';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GameCaption"
        component={GameCaption}
        durationInFrames={60}
        fps={30}
        width={280}
        height={130}
        defaultProps={{
          slug: 'example-game',
          name: 'Example Game',
          desc: 'An example game description.',
          cat: 'action',
          theme: 'default',
        }}
      />
    </>
  );
};
