import {
  notify
} from '@/commons/utils/notify'

import {
  filterParams
} from '@/commons/utils'

export default {

  // 获取表格数据
  getTableData: function (obj, fun) {
    obj.searchData = filterParams(obj.searchData)
    obj.loading = true
    fun(obj.searchData).then(response => {
      var res = notify(obj, response, true)
      if (res) {
        obj.tableData = response.data.list
        obj.total = response.data.total
        obj.flushTable()
      }
      obj.loading = false
    })
  },

  getTableDataPage: function (obj, fun) {
    obj.searchData = filterParams(obj.searchData)
    obj.loading = true
    fun(obj.searchData).then(response => {
      var res = notify(obj, response, true)
      if (res) {
        if (response.data.page) {
          obj.tableData = response.data.page.list
          obj.total = response.data.page.total
        } else {
          obj.tableData = response.data.list
          obj.total = response.data.total
        }
      }
      obj.loading = false
    })
  },
  // 删除数据
  deleteData: function (obj, fun, param) {
    obj.$confirm('确认删除该记录吗?', '提示', {
        type: 'warning',
        cancelButtonClass: "btn-custom-cancel"
      })
      .then(() => {
        fun(param).then(response => {
          var res = notify(obj, response)
          if (res) {
            obj.getTableData()
          }
        })
      }).catch(() => {

      })
  }
}



