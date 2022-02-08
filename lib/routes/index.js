const ToolsHello = require('./tools-hello');
const ToolsListMgr = require('./tools-list-manager');

module.exports = {
  ToolsHello,
  Load_ToolsListMgr: ToolsListMgr.Load,
  Post_ToolsListMgr: ToolsListMgr.Post,
};
