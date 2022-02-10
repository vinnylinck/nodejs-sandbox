const ToolsHello = require('./tools-hello');
const ToolsListMgr = require('./tools-list-manager');

module.exports = {
  ToolsHello,
  Load_ToolsListMgr: ToolsListMgr.Load,
  Post_ToolsListMgr: ToolsListMgr.Post,
  Load_ToolsListMgr_Items: ToolsListMgr.LoadItems,
  Post_ToolsListMgr_Items: ToolsListMgr.PostItem,
  Delete_ToolsListMgr_Items: ToolsListMgr.DeleteItem,
  Patch_ToolsListMgr_Items: ToolsListMgr.PatchItem,
};
