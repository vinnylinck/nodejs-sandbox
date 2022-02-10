const ToolsAccessMgr = require('./tools-access-manager');
const ToolsListMgr = require('./tools-list-manager');
const ToolsEvl = require('./tools-event-listener');

module.exports = {
  Load_ToolsAccess: ToolsAccessMgr.Load,
  Patch_ToolsAccess_Scopes: ToolsAccessMgr.PatchScope,
  Delete_ToolsAccess_Sessions: ToolsAccessMgr.DeleteSessions,

  Load_ToolsListMgr: ToolsListMgr.Load,
  Post_ToolsListMgr: ToolsListMgr.Post,
  Delete_ToolsListMgr: ToolsListMgr.DeleteList,
  Edit_ToolsListMgr: ToolsListMgr.EditList,
  Update_ToolsListMgr: ToolsListMgr.UpdateList,

  Load_ToolsListMgr_Items: ToolsListMgr.LoadItems,
  Post_ToolsListMgr_Items: ToolsListMgr.PostItem,
  Delete_ToolsListMgr_Items: ToolsListMgr.DeleteItem,
  Patch_ToolsListMgr_Items: ToolsListMgr.PatchItem,

  Load_ToolsEvents: ToolsEvl.Load,
};
