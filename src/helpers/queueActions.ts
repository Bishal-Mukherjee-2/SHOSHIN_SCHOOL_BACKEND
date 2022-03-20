let QueueActions = {
  init: function (action: any, payload: any, strategy: any, amqpChannel: any) {
    this.action = action;
    this.payload = payload;
    this.strategy = strategy;
    this.amqpChannel = amqpChannel;
  },

  exec: function (ch: any) {
    let self = this;
    return self.strategy.exec(ch, self.payload, self.amqpChannel);
  },
};

const getQueueActionExecutor = function (
  action: any,
  payload: any,
  strategy: any,
  amqpChannel = null
) {
  let queueActions = Object.create(QueueActions);
  queueActions.init(action, payload, strategy, amqpChannel);

  return queueActions;
};

const QueueActionHelper = { getQueueActionExecutor };
export default QueueActionHelper;
