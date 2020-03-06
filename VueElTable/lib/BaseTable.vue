<!-- 表格数据 -->
<template>
  <div class="base-table">
    <el-table :data='tableData'
              :border='configs.border||true'
              :max-height='configs.maxHeight'
              :highlight-current-row='configs.highlightCurrentRow||true'
              :stripe='configs.stripe||true'
              :fit='configs.fit||true'
              :show-summary='configs.showSummary||false'
              :summary-method='configs.handleSummary'
              :sum-text='configs.sumText'
              @selection-change="handleSelect"
              @current-change="(val)=>{configs.currentChange&&configs.currentChange(val)||(()=>{})}"
              v-loading="loading"
              :span-method="handleSpanMethod">
      <!-- 选择列：默认显示 -->
      <el-table-column type='selection'
                       v-if='!configs.selection||!configs.selection.hide'
                       :width='configs.selection&&configs.selection.width||"60"'
                       :align='configs.selection&&configs.selection.align||"center"'
                       header-align='center'>
      </el-table-column>
      <!-- 序号列：默认显示 -->
      <el-table-column type='index'
                       v-if='!configs.index||!configs.index.hide'
                       :label='configs.index&&configs.index.label||"序号"'
                       :align='configs.index&&configs.index.align||"left"'
                       header-align='center'>
      </el-table-column>
      <!-- 数据列 -->
      <el-table-column v-for='(item) in configs.columns'
                       :key='item.id'
                       :width='item.width'
                       :label='item.label'
                       :align='item.align||"left"'
                       header-align='center'>
        <!-- 没有复合列时 -->
        <template slot-scope='scope'
                  v-if="item.type!='multi'"
                  v-show="!item.hide">
          <!-- 输入框 -->
          <el-input v-if="scope.row.editFlag"
                    v-model="scope.row[item.prop]"
                    @keyup.native="console.log('')"></el-input>
          <!-- 链接 -->
          <el-button v-else-if='item.type==="link"'
                     type="text"
                     @click="item.handleClick(scope.row)">{{item.format?item.format(_.get(scope.row,item.prop),scope.row,scope.$index):_.get(scope.row,item.prop)}}
          </el-button>
          <!-- 格式化 -->
          <div v-else-if="item.format">
            <span :title="item.format(_.get(scope.row,item.prop),scope.row,scope.$index)"
                  :style="'color:'+((item.colorFormat&&item.colorFormat(_.get(scope.row,item.prop),scope.row,scope.$index))||item.color)+';'"
                  v-html="item.format(_.get(scope.row,item.prop),scope.row,scope.$index)"></span>
          </div>
          <!-- slot -->
          <slot v-else-if="item.type=='slot'"
                :name="item.slot"
                :row="scope.row"
                :index="scope.$index"
                :cell="scope[item.prop]"></slot>

          <!-- 文本 -->
          <span v-else>
            <span :title="_.get(scope.row,item.prop)||''"
                  :style="'color:'+((item.colorFormat&&item.colorFormat(_.get(scope.row,item.prop),scope.row,scope.$index))||item.color)+';'">
              {{_.get(scope.row,item.prop)||'--' }}</span>
          </span>
        </template>
        <!-- 有复合列 -->
        <div v-if="item.type=='multi'">
          <el-table-column v-for="it in item.childs"
                           :key="it.id"
                           :label='it.label'
                           :align='it.align||"left"'
                           header-align='center'>
            <template slot-scope='scope'
                      v-if="!it.type">
              <!-- 输入框 -->
              <el-input v-if="scope.row.editFlag"
                        v-model="scope.row[it.prop]"
                        @keyup.native="console.log('')"></el-input>
              <!-- 链接 -->
              <el-button v-else-if='it.type==="link"'
                         type="text"
                         @click="it.handleClick(scope.row)">{{it.format?it.format(_.get(scope.row,it.prop),scope.row,scope.$index):_.get(scope.row,it.prop)}}
              </el-button>
              <!-- 格式化 -->
              <div v-else-if="it.format">
                <span :style="'color:'+((it.colorFormat&&it.colorFormat(_.get(scope.row,it.prop),scope.row,scope.$index))||it.color)+';'"
                      v-html="it.format(_.get(scope.row,it.prop),scope.row,scope.$index)"></span>
              </div>

              <slot v-else-if="it.type=='slot'"
                    :name="it.slot"
                    :row="scope.row"
                    :index="scope.$index"
                    :cell="scope[it.prop]"></slot>

              <!-- 文本 -->
              <span v-else>
                <span :style="'color:'+((it.colorFormat&&it.colorFormat(_.get(scope.row,it.prop),scope.row,scope.$index))||it.color)+';'">
                  {{_.get(scope.row,it.prop)||'--' }}</span>
              </span>
            </template>
          </el-table-column>
        </div>
      </el-table-column>
      <!-- 操作列 -->
      <el-table-column v-if='!configs.handle||!configs.handle.hide'
                       :label='configs.handle&&configs.handle.label||"操作"'
                       :width='configs.handle&&configs.handle.width||""'
                       :align='configs.handle&&configs.handle.align||"center"'
                       header-align='center'
                       fixed='right'>
        <template slot-scope="scope">

          <span v-if="configs.flag">

            <slot v-if="configs.handle.type=='slot'"
                  :name="configs.handle.slot"
                  :row="scope.row"
                  :index="scope.$index"></slot>

            <el-button v-else
                       v-for='(item,key) in configs.handle.options'
                       :key="key"
                       :disabled="item.disabled||false"
                       :type="item.type||'default'"
                       @click='()=>{item.handle?item.handle(scope.row):$emit(item.nativeHandle,scope.row)}'>
              <!-- <svg-icon v-if='item.sicon'
                        class-name="international-icon"
                        :icon-class="item.sicon" /> -->
              {{item.label}}

            </el-button>

          </span>
          <span v-else>
            <el-button v-for='(val,key) in configs.handle.options'
                       v-if="!val.hide||!val.hide(scope)"
                       :icon="val.icon"
                       :key="key"
                       :disabled="val.disabled||false"
                       :type="val.type||'default'"
                       @click='()=>{if(val.handle){val.handle(scope.row)}else{$emit(val.nativeHandle,scope.row)}}'>
              <!-- <svg-icon v-if='val.sicon'
                        class-name="international-icon"
                        :icon-class="val.sicon" /> -->
              {{!val.both?val.label:(!scope.row.editFlag?'编辑':'保存')}}
            </el-button>
          </span>

        </template>

      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { format } from 'url';
export default {
  name: 'BaseTable',
  props: {
    configs: {
      type: Object,
      default () {
        return {}
      }
    },
    tableData: {
      type: Array,
      default () {
        return []
      }
    },
    loading: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data () {
    return {
      // 编辑行的标识
      editFlag: false
    }
  },
  computed: {
    _ () {
      return _
    }
  },
  created () {
    // console.log('configs', this.configs)
  },
  methods: {
    emitEventHandler (event) {
      this.$emit(event, ...Array.from(arguments).slice(1))
    },
    doLayout () {
      if (this.$refs['table']) {
        this.$refs['table'].doLayout()
      }
    },
    // 选择多行数据
    handleSelect (selectRows) {
      this.$emit('selectNumChange', selectRows.length)
      if (this.configs.handleSelect) {
        this.configs.handleSelect(selectRows)
      } else {
        this.$emit('selection-change', selectRows)
      }
    },
    // 合并行或列的计算方法
    handleSpanMethod ({ row, column, rowIndex, columnIndex }) {
      if (this.configs['span-method']) {
        return this.configs['span-method']({ row, column, rowIndex, columnIndex })
      }
    }
  }
}
</script>

<style lang="scss" >
</style>
