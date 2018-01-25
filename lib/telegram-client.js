const path = require('path')
const TelegramAPI = require('tg-cli-node')
// const os = require('os')

const TG_CLI_PATH = process.env.TG_CLI_PATH
if (process.env.NODE_ENV === 'production' && !process.env.TG_CLI_PATH) {
  console.warn('TG_CLI_PATH not set') // eslint-disable-line no-console
}

const config = {
  telegram_cli_path: path.join(TG_CLI_PATH, '/bin/telegram-cli'), //path to tg-cli (see https://github.com/vysheng/tg)
  telegram_cli_socket_path: path.join(TG_CLI_PATH, 'socket'), // path for socket file
  server_publickey_path: path.join(TG_CLI_PATH, '/tg-server.pub') // path to server key (traditionally, in %tg_cli_path%/tg-server.pub)
}

const Client = new TelegramAPI(config)

module.exports = Client
