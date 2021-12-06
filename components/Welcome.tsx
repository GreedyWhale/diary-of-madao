import React from 'react';

import styles from '~/assets/styles/welcome.module.scss';

const Welcome = () => {
  const [welcomeText, setWelcomeText] = React.useState<{
    currentIndex: number;
    currentRow: number;
    rawText: string[];
    displayText: string[];
  }>({
    currentIndex: 0,
    currentRow: 0,
    rawText: ['欢迎来到牢骚百物语!', '这里记录了我的所有技术笔记', '希望可以帮到你^_^'],
    displayText: [],
  });

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      let { currentIndex, currentRow, rawText, displayText } = welcomeText;
      if (currentRow === rawText.length - 1 && currentIndex === rawText[currentRow].length) {
        return;
      }

      if (currentIndex === rawText[currentRow].length) {
        currentIndex = 0;
        currentRow += 1;
      }

      const character = rawText[currentRow].charAt(currentIndex);
      displayText[currentRow] = displayText[currentRow] ? displayText[currentRow] + character : character;
      setWelcomeText({
        currentIndex: currentIndex + 1,
        currentRow,
        rawText,
        displayText,
      });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [welcomeText]);

  return (
    <div className={styles.welcome}>
      {welcomeText.displayText.map(value => (<p key={value}>{value}</p>))}
    </div>
  );
};

export default Welcome;
