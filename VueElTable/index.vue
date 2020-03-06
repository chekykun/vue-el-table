<!-- 数据栏 -->
<template>
  <div :class='!configs.styleNo?"table-app-container":""' v-if="tableFlag">
    <!--搜索栏-->
    <base-search ref="search"
                 v-if='configs.search'
                 :configs='configs.search'
                 :searchData='values.searchData||searchData'
                 @reset="handleReset"
                 @search="handleSearch"></base-search>
    <!--工具栏-->
    <div class='toolbar-container'>
      <base-toolbar ref="toolbar"
                    v-if='configs.toolbar'
                    :configs='configs["toolbar"]'
                    :sels='sels'
                    @add="handleAdd"
                    @batch-remove="batchRemove"
                    :selectedRows="selectedRows"></base-toolbar>
    </div>
    <!-- 数据栏 -->
    <!-- 多个表格切换 -->
    <el-tabs v-if="configs.tables"
             v-model="activeName"
             type="card"
             @tab-click="handleTabClick"
             @get-table-data="getTableData">
      <el-tab-pane v-for="table in configs.tables"
                   :key="table.name"
                   :label="table.label"
                   :name="table.name">
        <base-table ref="table"
                    :configs='table'
                    :tableData='values.tableData'>
          <template slot-scope="scope"
                    v-for="slot in table.slots"
                    :slot="slot">
            <slot :name="slot"
                  :row="scope.row"
                  :index="scope.$index"></slot>
          </template>
        </base-table>
      </el-tab-pane>
    </el-tabs>
    <!-- 单个表格 -->
    <base-table v-else
                ref="table"
                :configs='configs.table'
                :loading="configs.loading?configs.loading:loading"
                :tableData='values.tableData||tableData'
                @view="handleView"
                @edit="handleEdit"
                @delete="handleDelete"
                @selectNumChange="selectNumChange"
                @selection-change="selectionChange">
      <!-- 操作列 -->
      <template slot-scope="scope"
                slot="handle">
        <slot v-if="configs.table.handle.type=='slot'"
              :name="configs.table.handle.slot"
              :row="scope.row"
              :index="scope.$index"></slot>
      </template>
      <template slot-scope="scope"
                v-for="slot in configs.table.slots"
                :slot="slot">
        <slot :name="slot"
              :row="scope.row"
              :index="scope.$index"></slot>
      </template>
    </base-table>
    <!-- 分页栏 -->
    <div class='pagination-container'>
      <base-pagination ref="pagination"
                       :configs='configs.pagination||searchData'
                       :total='total'
                       @size-change='handleSizeChange'
                       @current-change='handleCurrentChange'></base-pagination>
    </div>
  </div>
</template>
<script>
import BasePagination from './lib/BasePagination'
import BaseToolbar from './lib/BaseToolbar'
import BaseTable from './lib/BaseTable'
import BaseSearch from './lib/BaseSearch'


import apiUtils from './apiUtils'
// import { defaultCipherList } from 'constants';

export default {
  name: 'VueElTable',
  components: {
    BasePagination,
    BaseToolbar,
    BaseTable,
    BaseSearch
  },
  created () {
    // 多个表格，默认显示第一个
    if (this.configs.tables && this.configs.tables.length > 1) {
      this.activeName = this.configs.tables[0].name
    }
    this.$nextTick(function () {
      this.$refSearch = this.$refs.search
      this.$refToolbar = this.$refs.toolbar
      this.$refTable = this.$refs.table
      this.$refPagination = this.$refs.pagination
    })
    // 单个表格
    if (this.configs.table) {
      this.configs.table.slots = []
      this.configs.table.columns.map(column => {
        if (column.type == 'slot') {
          this.configs.table.slots.push(column.slot)
        }
      })
    }
    // 多个表格
    if (this.configs.tables) {
      this.configs.tables.map(table => {
        table.slots = []
        table.columns.map(column => {
          if (column.type == 'slot') {
            table.slots.push(column.slot)
          }
        })
      })
    }
      _.assign(this.searchData,this.values.searchData)
    // flag=1
    if (this.configs.flag === 1) {
      this.getTableData()
    }
  },

  watch: {
    configs: {
      handler (curVal, oldVal) {
        // console.log(curVal, oldVal)
      },
      deep: true
    },
    searchId: {
      handler (curVal, oldVal) {
        this.getTableData()
      }
    }
  },

  props: {
    // 配置类参数
    configs: {
      type: Object,
      default () {
        return {
          loading: false, // 加载标识
          search: {}, // 搜索栏
          toolbar: {}, // 工具栏
          table: {}, // 表格
          pagination: {} // 分页栏
        }
      }
    },
    values: {
      type: Object,
      default () {
        return {
          // 表格数据
          tableData: [
          ],
          // 搜索条件数据
          searchData: {
          }
        }
      }
    },
    tabChange: {
      type: Function
    },
    dataKey: {
      type: String
    },
    apis: {
      type: Object
    },
    searchId: {
      type: String,
      default: "0"
    }
  },
  data () {
    return {
      activeName: '',
      searchData: {
        pageNum: 1,
        pageSize: 15
      },
      // flag=1
      tableDataApi: "",
      tableData: [],
      total: 0,
      sels: [],
      tableFlag:true,
      loading: false,
      slots: [],
      selectedRows: 0
    }
  },
  methods: {
    // 多个表格时切换表格
    handleTabClick (tab, e) {
      this.values.tableData = []
      this.configs.pagination.total = 1
      this.configs.handleTabClick(tab, e)
    },

    // flag=1
    handleReset (searchData) {
      _.assign(searchData ,{
        pageNum: 1,
        pageSize: searchData.pageSize
      })
      if(this.configs.handleReset){
        this.configs.handleReset(searchData)
      }
      _.assign(this.searchData,searchData)
      this.handleSearch(this.searchData)
    },
    // 搜索
    handleSearch (searchData) {
      _.assign(this.searchData,this.values.searchData)
      this.searchData = Object.assign(this.searchData, searchData)
      this.searchData.pageNum = 1
      this.getTableData()
      this.$nextTick(() => {
        this.doLayout()
      })
    },
    selectNumChange (num) {
      this.selectedRows = num || 0
    },
    flushTable(){
      this.tableFlag=false
      setTimeout(() => {
        this.tableFlag=true
      }, 200);
    },
    // 获取表格数据
    getTableData () {
      
      if (this.searchId) {
        this.searchData.id = this.searchId
        apiUtils.getTableDataPage(this, this.apis['getTableData']);
      } else if (this.searchId === "") {
        apiUtils.getTableData(this, this.apis['getTableData']);
      } else {
        apiUtils.getTableData(this, this.apis['getTableData']);
      }
      this.$nextTick(() => {
        this.doLayout()
      })
    },
    // 添加弹窗
    handleAdd () {
      this.$emit('open-dialog', 'add', {}, false)
    },
    // 批量删除
    batchRemove () {
      var param = { ids: this.sels.map(item => item[this.dataKey]) }
      this.baseDelete(param)
    },
    // 编辑弹窗
    handleEdit (row) {
      this.$emit('open-dialog', 'edit', row, false)
    },
    // 预览弹窗
    handleView (row) {
      this.$emit('open-dialog', 'view', row, true)
    },
    // 删除数据
    handleDelete (row) {
      var param = { ids: [row[this.dataKey]] }
      this.baseDelete(param)
    },
    // 切换每页显示数据数量
    handleSizeChange (val) {
      this.searchData.pageSize = val
      this.getTableData()
    },
    handleCurrentChange (val) {
      this.searchData.pageNum = val
      this.getTableData()
    },
    selectionChange (selection) {
      this.sels = selection;
    },
    // 通用删除方法
    baseDelete (param) {
      apiUtils.deleteData(this, this.apis['deleteData'], param)
    },
    // 刷新表格
    doLayout () {
      this.$refs['table'].doLayout()
    }

  }
}
</script>

<style lang="scss" >
.table-app-container {
  text-align: left;
  padding: 0;
  .toolbar-container {
    margin-bottom: 5px;
  }

  .pagination-container {
    // text-align: center;
  }
}
.el-message-box{
  .btn-custom-cancel {
    float: right;
    margin-left: 10px;
  }
}
</style>
