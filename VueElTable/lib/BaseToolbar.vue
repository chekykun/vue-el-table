<!-- 工具栏 -->
<template>
  <div class="base-toolbar">
    <el-row>
      <div v-if="configs.flag&&flag">
        <span v-if="configs&&!configs.hide">
          <el-button
            v-for="(item,key) in configs.options"
            :key="key"
            :disabled="item['disabled']||disableCon[(item.selectType||'none')]"
            :type="item.type||'default'"
            @click="()=>{$emit(item.nativeHandle)}"
          >
            <!-- <svg-icon v-if='item.sicon'
                    class-name="international-icon"
            :icon-class="item.sicon" />-->
            {{item.label}}
          </el-button>
        </span>
      </div>

      <div v-else>
        <span v-if="configs&&!configs.hide">
          <el-button
            v-for="(val, key) in configs.options"
            :key="key"
            :icon="val.icon||''"
            :type="val.type||'default'"
            :disabled="val['disabled']||disableCon[(val.selectType||'none')]"
            @click="()=>{val.handle?val.handle():$emit(val.nativeHandle)}"
          >
            <!-- <svg-icon v-if='val.sicon'
                      class-name="international-icon"
            :icon-class="val.sicon" />-->
            <!-- 判断按钮是否有切换功能 -->
            {{!val.both?val.label:(!val.editFlag?val.labelEdit:val.labelSave)}}
          </el-button>
        </span>
      </div>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "BaseToolbar",
  mounted() {},
  props: {
    configs: {
      type: Object,
      default: {}
    },
    sels: {
      type: Array,
      default: [],
      require: true
    },
    selectedRows: {
      default: 0
    }
  },
  watch: {
    configs: {
      handler(val) {
        this.flag = false;
        this.$nextTick(() => {
          this.flag = true;
        });
      },
      deep: true
    },
    // 选择列
    selectedRows(val) {
      // 没有选择数据，禁用按钮
      if (val == 0) {
        this.disableCon.one = true;
        this.disableCon.multi = true;
      } else if (val == 1) {
        // 选择一行数据，解除禁用
        this.disableCon.one = false;
        this.disableCon.multi = false;
      } else {
        // 选择多行
        this.disableCon.one = true;
        this.disableCon.multi = false;
      }
    }
  },
  data() {
    return {
      flag: true,
      disableCon: {
        none: false,
        multi: true,
        one: true
      }
    };
  },
  methods: {}
};
</script>
<style lang="scss" >
</style>
