const axios = require('axios');
const fs = require('fs');
const chalk = require('chalk'); 
const QUERY_IDS_PATH = 'queries.txt'; 
const UA_PATH = 'user_agents.txt'; 



const REFERRER_ID = null; 
const WAIT_INTERVAL = 3000; 
const ROUND_INTERVAL = 14400000; 

const loadFileData = (filePath) => {
  try {
    return fs
      .readFileSync(filePath, 'utf-8')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean); 
  } catch (err) {
    console.error(chalk.red(`文件读取失败：${filePath}`));
    process.exit(1); 
  }
};

const QUERY_IDS = loadFileData(QUERY_IDS_PATH); 
const USER_AGENTS = loadFileData(UA_PATH); 


const randomWait = (min = 2000, max = 5000) =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min));


const pickGame = () => {
  const games = ['Darts', 'Football', 'Basketball'];
  return games[Math.floor(Math.random() * games.length)];
};


const getAxiosClient = (ua) => {
  return axios.create({
    headers: {
      'User-Agent': ua,
    },
  });
};


const authenticate = async (queryId) => {
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const client = getAxiosClient(ua);

  try {
    const { data } = await client.post('https://emojiapp.xyz/api/auth', {
      initData: queryId,
      refererId: REFERRER_ID,
    });

    console.log(chalk.green(`登录成功：${data.user.username} (${data.user.nameSurname})`));
    return { token: data.token, tickets: data.user.amountOfTickets, client };
  } catch (err) {
    console.error(chalk.red(`登录失败：${queryId}`, err.response?.data || err.message));
    return null;
  }
};


const handleFreeTickets = async (token, client) => {
  try {
    const { data } = await client.post(
      'https://emojiapp.xyz/api/users/free-tickets-eligibility',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.canClaim) {
      console.log(chalk.blue('可以领取免费票据，正在领取...'));
      await client.post(
        'https://emojiapp.xyz/api/users/claim-free-tickets',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(chalk.green('免费票据领取成功！'));
    } else {
      console.log(chalk.blue('目前没有免费票据可领取。'));
    }
  } catch (err) {
    console.error(chalk.red('免费票据检查失败：', err.response?.data || err.message));
  }
};


const getTasks = async (token, client) => {
  try {
    const { data } = await client.get('https://emojiapp.xyz/api/quests', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const validTasks = (taskList) =>
      taskList.filter((task) => !task.completed && task.option !== 'PAYMENT');

    return {
      daily: validTasks(data.quests.daily),
      oneTime: validTasks(data.quests.oneTime),
      special: validTasks(data.quests.special),
    };
  } catch (err) {
    console.error(chalk.red('任务获取失败：', err.response?.data || err.message));
    return { daily: [], oneTime: [], special: [] };
  }
};


const completeTask = async (taskId, token, client) => {
  try {
    const { data } = await client.get(
      `https://emojiapp.xyz/api/quests/verify?questId=${taskId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.message === 'Quest completed and reward granted') {
      console.log(chalk.green(`任务完成！奖励票据：${data.user.amountOfTickets}`));
    }
  } catch (err) {
    console.error(chalk.red(`任务完成失败：${taskId}`, err.response?.data || err.message));
  }
};


const playWithTickets = async (token, tickets, client) => {
  for (let i = 0; i < tickets; i++) {
    const game = pickGame();
    try {
      console.log(chalk.green(`正在玩游戏：${game}`));
      const { data } = await client.post(
        'https://emojiapp.xyz/api/play',
        { gameName: game },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(chalk.yellow(`游戏结果：${data.message}, 赢得积分：${data.pointsWon}`));
    } catch (err) {
      console.error(chalk.red('游戏执行失败：', err.response?.data || err.message));
    }
    await randomWait();
  }
};


const processAccount = async (queryId, index) => {
  console.log(chalk.bold.cyan(`处理账户 #${index}`));

  const auth = await authenticate(queryId);
  if (!auth) return;

  const { token, tickets, client } = auth;

  await handleFreeTickets(token, client);

  const tasks = await getTasks(token, client);
  for (const task of [...tasks.daily, ...tasks.oneTime, ...tasks.special]) {
    await completeTask(task.id, token, client);
    await randomWait();
  }

  if (tickets > 0) {
    await playWithTickets(token, tickets, client);
  }

  console.log(chalk.green(`账户 #${index} 完成处理！\n`));
};


const startProcess = async () => {
  while (true) {
    let accountIdx = 1;
    for (const queryId of QUERY_IDS) {
      await processAccount(queryId, accountIdx++);
    }

    console.log(chalk.magenta('所有账户处理完成，等待下一轮...'));
    await randomWait(ROUND_INTERVAL, ROUND_INTERVAL); 
  }
};

startProcess();
