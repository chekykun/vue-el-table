<!-- 搜索栏 -->
<template>
  <div ref='base-search'
       :class="toggleStatus?'base-search':'base-search toggle'">
    <div>
      <el-row>
        <el-col :span="18">
          <el-form :inline='true'
                   :model="searchData"
                   ref="searchForm"
                   @submit.native.prevent='configs.search.handle'>
            <span v-for='(form, key,index) in configs.forms'
                  :key="index">
              <!-- 表单名称 -->
              <el-form-item :label='form.hide?"":form.label'>
                <!-- 若表单项不隐藏 -->
                <div v-if="!form.hide">
                  <!-- 输入框 -->
                  <el-input v-if="form.type === 'input' || form.type === undefined"
                            v-model="searchData[form.prop]"
                            :clearable='getClearable(form)'
                            @keyup.enter.native="(value)=>form.handleEnter(value, form)" />
                  <!-- 下拉选择框 -->
                  <el-select v-else-if="form.type === 'select'"
                             v-model="searchData[form.prop]"
                             :clearable='getClearable(form)'
                             :filterable="true"
                             :placeholder="form.placeholder"
                             @change="(val)=>{form.change(val)?form.change:(()=>{})}">
                    <!-- 选项 -->
                    <div v-if='form.options&&!form.options.length'>
                      <el-option v-for="(val, key,index) in form.options"
                                 :key="index"
                                 :value="form.optionToggle?val:key"
                                 :label="form.optionToggle?key:val"
                                 v-show="!form.hide" />
                    </div>
                    <div v-else-if="form.optionType==='List'">
                      <el-option v-for="(option, key,index) in form.options"
                                 :key="index"
                                 :value="option"
                                 :label="option" />
                    </div>
                    <div v-else>
                      <el-option v-for="option in form.options"
                                 :key="option[form.valueKey||'value']"
                                 :value="option[form.valueKey||'value']"
                                 :label="option[form.labelKey||'label']" />
                    </div>
                  </el-select>
                  <!-- 日期选择器 -->
                  <el-date-picker v-else-if="form.type === 'date'||form.type === 'year'||form.type === 'month'"
                                  v-model="searchData[form.prop]"
                                  :type="form.type||'date'"
                                  :format="form.format||'yyyy-MM-dd'"
                                  :value-format="form['value-format']||'yyyy-MM-dd'"
                                  :clearable='getClearable(form)'
                                  :placeholder="form.placeholder"
                                  :picker-options="form.pickerOptions || {}"
                                  @change="(value)=>{form.handleChange?form.handleChange(value, form):(()=>{})}" />
                  <!-- 日期时间选择器 -->
                  <el-date-picker v-else-if="form.type === 'datetime'"
                                  v-model="searchData[form.prop]"
                                  :type="form.type||'datetime'"
                                  :format="form.format||'yyyy-MM-dd HH:mm:ss'"
                                  :value-format="form['value-format']||'yyyy-MM-dd HH:mm:ss'"
                                  :clearable='getClearable(form)'
                                  :placeholder="form.placeholder"
                                  :picker-options="form.pickerOptions || {}"
                                  @change="(value)=>{form.handleChange?form.handleChange(value, form):(()=>{})}" />
                </div>
              </el-form-item>
              <br v-if="index==(num-1)">
            </span>
          </el-form>
        </el-col>
        <!-- 按钮 -->
        <el-col :span="6">

          <!-- <span class="btn-group"
                v-if="configs.flag">
            <el-button @click='toggleSearch'
                       v-if="getFormsNum>formMax">
              {{toggleLabel}}
            </el-button>
            <el-button v-for='(item,key,index) in configs.buttons'
                       :key='index'
                       :type="item.type||''"
                       @click='()=>{$emit(item.nativeHandle,searchData)}'>
              <svg-icon v-if='item.sicon'
                        class-name="international-icon"
                        :icon-class="item.sicon" />
              {{item.label}}
            </el-button>
          </span> -->
          <span class="btn-group">
            <!-- 展开按钮 -->
            <el-button @click='toggleSearch'
                       v-if="getFormsNum>formMax">
              {{toggleLabel}}
            </el-button>
            <!-- 搜索、重置等操作按钮 -->
            <el-button v-for='(val, key) in configs.buttons'
                       :key='key'
                       :icon="val.icon||''"
                       :type="val.type||''"
                       @click='()=>{val.handle?val.handle():$emit(val.nativeHandle,searchData)}'>
              <!-- <svg-icon v-if='val.sicon'
                        class-name="international-icon"
                        :icon-class="val.sicon" /> -->
              {{val.label}}
            </el-button>
          </span>
        </el-col>
      </el-row>
    </div>
  </div>

</template>

<script>
export default {
  name: 'BaseSearch',
  mounted () {
  },
  created () {
  },
  watch: {},
  // 计算属性
  computed: {
    // 是否显示清除按钮
    getClearable () {
      return (form) => {
        // 表单内有定义，按定义的显示
        if (form && form.clearable !== undefined) {
          return form.clearable
        } else {
          if (this.configs && this.configs.clearable !== undefined) {
            return this.configs.clearable
          } else {
            return true
          }
        }
      }
    },
    // 每行可显示多少项表单
    num () {
      // 获取内容区域（除菜单栏、面包屑和导航栏外的区域）
      let form = document.getElementsByClassName('app-main')[0]
      if (!form) {
        form = document.getElementById('app')
      }
      // 获取内容区域宽度
      let width = form.clientWidth
      width = width * 3 / 4
      // 计算每行可显示表单数
      let num = Math.floor(width / 300)
      console.log(width, num)
      return num
    },
    // 表单总数
    getFormsNum () {
      let num = 0
      for (let key in this.configs.forms) {
        num++
      }
      return num
    },
    // 每行最多可显示表单数
    formMax () {
      if (this.configs.formMax) {
        return this.configs.formMax
      } else {
        return this.num
      }
    },
    //是否显示标签
    getLabel () {
      return (form) => {
        if (form.hide) {
          return ''
        } else {
          return form.label
        }
      }
    },
    // getOptionsType () {
    //   return (options, toggle) => {
    //     try {
    //       if (Array.isArray(options)) {
    //         if (typeof options[0] === 'string') {
    //           // 字符串数组
    //           return 'stringArray'
    //         } else if (options[0] instanceof Object) {
    //           // 对象数组
    //           return 'objectArray'
    //         }
    //       } else if (options instanceof Object) {
    //         if (toggle) {
    //           return 'toggleObject'
    //         } else {
    //           // 对象类型
    //           return 'object'
    //         }
    //       }
    //     } catch (e) {
    //     }
    //     return 'object'
    //   }
    // }
  },
  props: {
    // 配置内容
    configs: {
      type: Object,
      default () {
        return {}
      }
    },
    // 搜索数据
    searchData: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      toggleStatus: false,
      toggleLabel: '展开',
    }
  },
  methods: {
    // 提交表单
    handleSubmit () { },
    // 提交表单
    handleChange (val, form) {
      if (form.handleChange) {
        form.handleChange(val)
      }
    },
    // 提交表单
    handleEnter (e, form) {
      if (form.handleEnter) {
        form.handleEnter()
      }
    },
    handlePickerOptions () { },
    handleChangeOptions () { },
    // 展开按钮控制
    toggleSearch () {
      this.toggleStatus = !this.toggleStatus
      this.toggleLabel = this.toggleLabel === '展开' ? '收起' : '展开'
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" >
.base-search {
  font-size: 12px;
  .el-input--mini,
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: 200px;
  }
  .btn-group {
    padding-top: 3px;
    margin-bottom: 5px;
    display: inline-block;
  }
}
.base-search.toggle {
  height: 41px;
  overflow: hidden;
}
</style>
