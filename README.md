## 📦 克隆与安装
### 1. 克隆仓库
首先，将项目克隆到本地：
 ```
 git clone https://github.com/ziqing888/webemoji.git
 ```
### 2. 进入项目目录
```
cd webemoji
```
### 3. 安装依赖
运行以下命令以安装所需依赖：
```
 npm install
```
### 🔑 配置 QueryID
项目需要 queryIds（用户标识符）文件来模拟用户操作。请在项目目录中创建一个 queries.txt 文件
### 🔑 获取 QueryID

如果你在使用 Telegram WebApp，可以通过以下步骤获取 `QueryID`：

1. 打开你的 Telegram WebApp。
2. 按 `F12` 打开开发者工具，切换到 `Console` 面板。
3. 输入以下命令以获取 `initData`：
   ```javascript
   copy(Telegram.WebApp.initData)
    ```
将复制的 initData 粘贴到项目中的 queries.txt 文件中

## 🚀 启动脚本
确保 queries.txt 和 user_agents.txt 文件准备就绪，然后运行以下命令启动脚本：
 ```
npm start
 ```

### 📢 电报频道：https://t.me/ksqxszq

### 免責聲明

此机器人仅用于教育目的。使用风险自负。开发人员不对因使用此机器人而导致的任何帐户封禁或处罚负责。
