const sleepTime = async (number: number): Promise<void> => {
  const wantSleep: Promise<void> = new Promise((reslove) => {
    setTimeout(() => {
      reslove();
    }, number);
  });

  const wakeUp = await wantSleep;
  return wakeUp;
};

export default sleepTime;
