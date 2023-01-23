import { createApp, ref, onMounted, reactive } from "https://unpkg.com/vue@3.2.4/dist/vue.esm-browser.prod.js";
import { dataApps, dataQuestions, dataSearch } from "./data.js"

const app = createApp({
  setup() {

    const questionNum = dataQuestions.length;
    const results = ref([]);
    const currentNum = ref(1);
    const currentQa = ref(dataQuestions[0]);
    const matchApps = ref({});
    const isSearch = ref(false);
    const matchSearchApps = ref({});

    /**
     * 現在のQAを取得する
     */
    const getQa = () => {
      currentQa.value = dataQuestions.find(qa => qa.no == currentNum.value);
    };

    /**
     * 回答を保存する
     */
    const saveAnswer = (answer) => {
      results.value.push(answer);
      results.value = results.value.flat();

      // 1問目の場合は返却
      if(currentNum.value == 1) return nextQuestion();

      // 重複回答のみ保存
      results.value = results.value.filter((value, index, self) => self.indexOf(value) === index && self.lastIndexOf(value) !== index);

      nextQuestion();
    };

    /**
     * 次の問題へ進む
     */
    const nextQuestion = () => {
      currentNum.value++;

      // 次に進むコンテンツを判別
      if(currentNum.value > questionNum) {
        getMatchApps();
      }else{
        getQa();
      }
    };

    /**
     * 診断結果を取得
     */
    const getMatchApps = () => {
      matchApps.value = results.value.map(label => dataApps.find(app => app.label == label));
    };

    /**
     * 診断データリセット
     */
    const clearQa = () => {
      results.value = [];
      currentNum.value = 1;
      currentQa.value = dataQuestions[0];
      matchApps.value = {};
    };

    /**
     * 検索結果ページを表示
     */
     const showSearchResult = () => {
       isSearch.value = true;
       window.scrollTo(0, 0);
    };

    /**
     * 子コンポーネントから受け取った値を代入
     */
    const handleEvent = (val) => {
      getSearchMatchApps(val);
    };

    /**
     * 検索結果から対象ソースを取得
     */
    const getSearchMatchApps = (matchApps) => {
      matchSearchApps.value = matchApps.map(result => dataApps.find(app => app.label == result));
    };

    return {
      questionNum,
      results,
      currentNum,
      currentQa,
      saveAnswer,
      matchApps,
      clearQa,
      isSearch,
      showSearchResult,
      handleEvent,
      matchSearchApps
    };
  }
});

app.component('search-box', {
  props:['showSearchResult'],
  setup(props, {emit}){
    const search = dataSearch;
    const selectState = reactive({
      purpose: "利用目的",
      age: "年齢層",
      price: "料金",
      membership: "会員数",
      release: "リリース日"
    });
    const results = ref([]);

    /**
     * 該当アプリを取得
     */
    const getMatchApps = () => {
      const items = search.filter(cond => Object.keys(selectState).map(key => key == cond.label));
      const selectedValues = items.map(item=>item.select.find(select => select.value == selectState[item.label]));
      const seletedResults = selectedValues.map(select=>select.results);

      // それぞれの選択肢から重複のみ保存
      seletedResults.forEach((item, index) => {
        results.value.push(item);
        results.value = results.value.flat();

        // 最初は返却
        if(index == 0) return;
  
        // 重複回答のみ保存
        results.value = results.value.filter((value, index, self) => self.indexOf(value) === index && self.lastIndexOf(value) !== index);
      });
    };

    /**
     * 検索結果ページを表示
     */
    const getSearchResult = () => {
      getMatchApps();
      emit('search-result-event', results.value);
      props.showSearchResult();

      // 対象アプリがない場合は値を初期化
      if(results.value.length == 0){
        selectState = {
          purpose: "利用目的",
          age: "年齢層",
          price: "料金",
          membership: "会員数",
          release: "リリース日"
        };
      }
    };

    return {
      search,
      selectState,
      getSearchResult,
    };
  },
  template:`
  <ul>
    <li v-for="(item,index) in search" :key="item">
        <div class="selector">
            <select v-model="selectState[item.label]">
                <option v-for="select in item.select" :key="select" :value="select.value">{{ select.value }}</option>
            </select>
        </div>
    </li>
    <li>
        <button type="submit" @click="getSearchResult"><span>検索</span></button>
    </li>
  </ul>
`
});
app.mount("#app");