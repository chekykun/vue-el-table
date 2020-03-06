# vue-el-table
vue element table
#说明
需要引入element-ui(2.9.1) 和lodash.js
#引入
```
  import VueElTable from './VueElTable'
```
#使用
```
  <template>
  <div class="duty-person">
    <vue-el-table :configs="configs" :values="values"></vue-el-table>
  </div>
</template>

<script>
  import { getPersonList, deletePersonDetail } from "@/commons/api/dutyPerson";

  import VueElTable from '@/components/VueElTable'
  export default {
    name: "DutyList",
    components: {
       VueElTable
    },
    //数据部分
    data() {
      return {
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        selectRows: [],
        row: {},

        // 参数默认值
        listQuery: {
          companyCode: undefined,
          name: undefined,
          positionId: undefined,
          page: 1,
          size: 15
        },
        disable: false,
        //操作类型备选值
        positionTypeOptions: {},

        //模块类型备选值
        moduleTypeOptions: {},

        dVisible: false,
        dUrl: "",
        positionMap: {},
        companyMap: {},
        values: {
          searchData: {
            companyCode: undefined,
            name: undefined,
            positionId: undefined,
            page: 1,
            size: 15
          },
          tableData: []
        },
        configs: {
          //搜索栏
          search: {
            buttons: {
              //重置按钮
              reset: { sicon: 'btn-reset', label: '重置', handle: this.handleReset },
              // 搜索按钮
              search: { sicon: 'btn-search', label: '搜索', handle: this.handleFilter }
            },
            // 表单项
            forms: {
              name: { label: '姓名', type: 'input', prop: 'name', show: true, placeholder: '姓名' },
              // companyCode: { label: '单位', type: 'input', prop: 'companyCode', show: true, placeholder: '单位' },
            },
          },
          //工具栏
          toolbar: {
            options: {
              add: { sicon: 'btn-add', handle: this.handleCreate, label: '新增人员' },
              delete: { sicon: 'btn-delete', handle: this.batchRemove, label: '批量删除', selectType: 'multi' }
            }
          },
          //表格数据
          table: {
            currentChange: this.selsChange,
            handleSelect: this.selsChange,
            // 操作列
            handle: {
              header: { width: 230, show: true, label: '操作' },
              options: {
                showDutyPerson: { label: '浏览', type: 'text', handle: this.showDutyPerson, sicon: 'btn-view' },
                editDutyPerson: { label: '编辑', type: 'text', handle: this.editDutyPerson, sicon: 'btn-edit' },
                deleteDutyPerson: { label: '删除', type: 'text', handle: this.deleteDutyPerson, sicon: 'btn-delete' }
              }
            },
            //数据列
            columns: [
              { prop: 'name', label: '姓名' },
              {
                prop: 'companyCode', label: '单位',
                format: (cell, row, index) => {
                  return this.companyMap[cell]
                }
              },
              { prop: 'mobilePhone', label: '电话', width: '100' },
              {
                prop: 'isGrobalDuty', label: '全局值班',
                format: (cell, row, index) => {
                  return cell == '0' ? '否' : '是'
                }
              },
              {
                prop: 'isWaterDuty', label: '水量调度值班',
                format: (cell, row, index) => {
                  return cell == '0' ? '否' : '是'
                }
              },
              {
                prop: 'isMsgRec', label: '短信',
                format: (cell, row, index) => {
                  return cell == '0' ? '否' : '是'
                }
              },
              {
                prop: 'positionId', label: '职务',
                format: (cell, row, index) => {
                  return this.positionMap[cell]
                }
              },
              { prop: 'jobFunction', label: '职责' },
              { prop: 'note', label: '备注' }
            ]
          },
          //分页栏
          pagination: {
            pageNum: 1, // 当前页
            size: 15, // 每页条数
            total: 1, // 总页数
            "page-sizes": [15, 25, 35, 50],
            handleSizeChange: (val) => {
              this.handleSizeChange(val)
            },
            handleCurrentChange: (val) => {
              this.handleCurrentChange(val)
            }
          }
        },
      };
    },

    //周期函数，创建时获取数据列表
    created() {
      this.getCompanyMap()
      this.getPositionMap()
      this.getList();
    },
    methods: {
      getPositionMap() {
        system.getDictionaryDetailsMap({ dictCode: 'SYS_POSITION' }).then(res => {
          _.assign(this.positionMap, res.data)
        })
      },
      getCompanyMap() {
        system.getDictionaryDetailsMap({ dictCode: 'SYS_COMPANY' }).then(res => {
          _.assign(this.companyMap, res.data)
        })
      },
      //获取数据列表
      getList() {
        //记载标识
        this.listLoading = true;
        this.listQuery = this.values.searchData
        getPersonList(this.listQuery).then(response => {
          try {
            this.list = response.data.list;
            this.total = response.data.total;
            this.values.tableData = response.data.list;
            this.values.total = response.data.total;
            this.configs.pagination.total = this.total;
            this.listLoading = false
          } catch (e) {
            console.log(e);
          }
        });
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 10);
      },

      //获取操作类型列表
      getTypeList() {
        getTypeListSelect().then(response => {
          this.operationTypeOptions = response.data;
          setTimeout(() => {
            this.listLoading = false;
          }, 1.5 * 1000);
        });
      },

      //调用模块类型列表
      getModuleList() {
        getModuleListSelect(this.listQuery).then(response => {
          this.moduleTypeOptions = response.data;
          setTimeout(() => {
            this.listLoading = false;
          }, 1.5 * 1000);
        });
      },

      //条件查询
      handleFilter() {
        //前往到第一页
        this.listQuery.page = 1;
        this.configs.pagination.pageNum = 1;
        this.getList();
      },

      //重置
      handleReset() {
        //前往到第一页
        this.listQuery.page = 1;
        this.listQuery.companyCode = undefined;
        this.listQuery.name = undefined;
        this.listQuery.positionId = undefined;
        this.listQuery.operationTime = "";
        this.configs.pagination.pageNum = 1;
        this.getList()
      },

      //显示每页条数
      handleSizeChange(val) {
        this.listQuery.size = val;
        this.getList();
      },

      //跳转页码
      handleCurrentChange(val) {
        this.listQuery.page = val;
        this.configs.pagination.pageNum = val;
        this.getList();
      },

      //浏览人员信息
      showDutyPerson(row) {
        this.disable = true
        this.row = row
        this.dVisible = true
      },

      //编辑人员信息
      editDutyPerson(row) {
        this.disable = false
        this.row = row
        this.dVisible = true
      },

      //新增人员
      handleCreate() {
        // console.log("create")
        this.disable = false
        this.row = {}
        this.dVisible = true
      },

      //删除一条记录
      deleteDutyPerson(row) {
        this.$confirm("确认删除此条记录吗？", "提示", {
          type: "warning"
        })
          .then(() => {
            var deleteUserInfo = { ids: [row.id] };
            deletePersonDetail(deleteUserInfo).then(res => {
              this.handleResponse(res, 'delete')
              this.listQuery.page = 1
              this.getList();
            });
          })
          .catch(() => { });
      },

      // 选中行
      selsChange: function (selectRows) {
        this.selectRows = selectRows;
      },

      //批量删除
      batchRemove: function (selectRows) {
        var ids = this.selectRows.map(item => item.id);
        // console.log("打印所有选中的用户：" + ids.join(","));
        this.$confirm("确认删除选中记录吗？", "提示", {
          type: "warning"
        })
          .then(() => {
            var deleteUserInfo = { ids };
            deletePersonDetail(deleteUserInfo).then(res => {
              this.handleResponse(res, 'delete')
              this.listQuery.page = 1
              this.getList();
            });
          })
          .catch(() => { });
      },
      handleResponse(res, msgType) {
        if (res.code == 0) {
          if (msgType == 'update') {
            this.notify('更新成功', 'success')
          } else if (msgType == 'add') {
            this.notify('添加成功', 'success')
          } else if (msgType == 'delete') {
            this.notify('删除成功', 'success')
          }
        } else if (res.code == -2) {
          if (msgType == 'update') {
            this.notify(res.msg, 'error')
          } else if (msgType == 'add') {
            this.notify(res.msg, 'error')
          } else if (msgType == 'delete') {
            this.notify(res.msg, 'error')
          }
        }
      },
      notify(msg, showType) {
        if (showType == 'success') {
          this.$notifyNative(this, msg, 'success')
        } else if (showType == 'error') {
          this.$notifyNative(this, msg, 'error')
        }
      }
    }
  };
</script>
```
