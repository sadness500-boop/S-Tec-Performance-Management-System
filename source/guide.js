/* =====================================================================
 * 매뉴얼 — 사용자 매뉴얼 · 제작자 관리매뉴얼 (프로그램 안 보기 · Word · PPT · PDF)
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const MANUAL = {
  user: {
    title: '사용자 매뉴얼', en: 'User Guide', file: '에스텍_성과관리시스템_사용자매뉴얼',
    sub: '현장 관리자 · 지사 담당 · 영업 담당이 성과를 기록하고 보고서를 만드는 방법',
    sections: [
      { h: '이 프로그램은', key: ['보이지 않는 성과를 숫자로', '업무량 · 예방·적발 · 환산가치 · 달성률', '일일 · 주간 · 월간 · 연간 성과', '고객사 보고서 Word · PPT · PDF · 엑셀'], img: 'm_main', blocks: [
        { p: '용역 업무의 가장 좋은 결과는 「아무 일도 일어나지 않는 것」입니다. 그래서 고객사는 「하는 게 없다」고 느끼기 쉽습니다. S-Tec Performance Management System(에스텍 성과 관리 시스템)은 그 「일어나지 않은 일」을 매일 기록하고 세어, 고객사가 읽을 수 있는 숫자와 보고서로 보여 줍니다.' },
        { table: { head: ['원칙', '무엇을 세나', '예'], rows: [['① 업무량', '매일 하는 기본 업무', '순찰 6회 · 화장실 점검 48회 · 출입 관리 420명'], ['② 예방·적발', '사고를 「막은」 활동', '소등 85건 · 시건 4건 · 누수 발견 · 무단침입 적발'], ['③ 환산가치', '원(₩)으로 바꾼 가치', '절전액 · 외주 대체비 · 적발 금액'], ['④ 달성률·품질', '계획 대비 실적 · 점검 점수', '순찰 계획 대비 98% · 품질점검 90.8점']] } },
        { tip: 'SPI(S-Tec Performance Index) = 계획 달성 35% + 품질 25% + 안전(사건 전건 조치) 20% + 업무개선 10% + 교육 10%. 90점 이상 S 우수 · 80점 이상 A 양호 · 70점 이상 B 보통 · 70점 미만 C 미흡.' }] },
      { h: '설치하고 시작하기', key: ['통합관리 시스템 메인 → 10번째 카드', '웹 주소 · 안드로이드 앱 · 홈 화면 추가', '통합 로그인(같은 아이디)', '처음 한 번 「성과 담당」 지정'], img: 'm_gate', blocks: [
        { table: { head: ['기기', '여는 방법'], rows: [['통합관리 시스템', '메인 화면 맨 아래 「S-Tec Performance Management System」 카드 → 열기 (다시 로그인하지 않음)'], ['PC', '크롬·엣지로 웹 주소 열기 → 주소창 오른쪽 설치 아이콘 → 바탕화면 앱'], ['안드로이드', '상단 「다운로드 QR」 → 안드로이드 앱(APK) → 「출처를 알 수 없는 앱」 허용 → 설치'], ['아이폰', '사파리로 웹 주소 → 공유 → 「홈 화면에 추가」']] } },
        { p: '웹 주소: https://sadness500-boop.github.io/S-Tec-Performance-Management-System/' },
        { ol: ['통합관리 시스템과 같은 아이디(이메일)·비밀번호로 로그인합니다.', '처음 열면 「성과 담당 지정」 화면이 나옵니다. 성명(필수)·직책·담당 지사·소속·연락처를 넣고 「성과 담당 지정하고 시작」을 누릅니다.', '담당 정보는 보고서 작성자·결재란에 들어가며, 상단 「성과 담당」 카드를 눌러 언제든 바꿀 수 있습니다.'] },
        { tip: '로그인하지 않아도 이 기기에서는 쓸 수 있지만, 로그인하면 여러 기기(PC·휴대폰)에서 같은 기록을 보고 회사 공유 서버에 저장됩니다.' }] },
      { h: '메인 화면 둘러보기', key: ['상단 바: 담당 · QR · 친구추천 · 계정 · 테마', '히어로: 오늘·이번 달 성과 요약', '현장 영상 5편 연속 재생', '5개 메뉴 탭'], img: 'm_main', blocks: [
        { table: { head: ['위치', '하는 일'], rows: [['좌측 상단 아이콘', '누르면 맨 위로 이동'], ['성과 담당', '담당자 지정·변경 (지정해야 프로그램이 열림)'], ['다운로드 QR', '웹 주소 · 안드로이드 앱 QR'], ['친구 추천', '동료에게 보낼 안내 문구 복사'], ['계정', '로그인·내 정보·비밀번호·로그아웃 (관리자는 관리자 페이지)'], ['☀ 주간 · ☾ 야간 · ▣ 시스템', '화면 밝기 테마'], ['왼쪽 아래 「메인」', '통합관리 시스템 메인 화면으로 돌아가기']] } },
        { p: '히어로의 네 숫자는 오늘 기록한 사업장 수, 이번 달 예방·적발 건수, 이번 달 환산가치, 이번 달 성과지수(SPI)입니다.' },
        { table: { head: ['영상 조작', '하는 일'], rows: [['⏮ / ⏭', '이전 / 다음 영상'], ['▶ / ⏸', '재생 / 일시정지 (영상을 눌러도 됨)'], ['⏹', '정지하고 처음으로'], ['🔇 / 🔊 · 음량 막대', '소리 켜기·끄기, 음량 조절 (처음에는 소리 꺼진 상태로 자동 재생)'], ['다음 영상 자동', '체크하면 끝난 뒤 자연스럽게 다음 영상으로 넘어감'], ['아래 썸네일 5개', '누르면 그 영상으로 바로 이동'], ['진행 막대', '누른 위치로 이동']] } }] },
      { h: '일일 실적 입력', key: ['사업장 · 일자 고르기', '업종 탭(보안·미화·시설·주차·안내)', '＋ / − 로 수량 입력', '「💾 저장」 — 같은 날 다시 열면 고쳐짐'], img: 'm_entry', blocks: [
        { ol: ['「✍ 일일 실적 입력」 탭을 엽니다.', '왼쪽에서 일자를 고릅니다. 달력의 초록 날짜는 이미 기록한 날입니다.', '조직을 고르거나 사업장명을 검색해 사업장을 누릅니다(초록 점 = 그 날 기록 있음).', '오른쪽 위 업종 탭을 고릅니다. 사업장에 없는 업종은 「업종 설정」에서 추가합니다.', '업무 항목마다 ＋ / − 를 누르거나 숫자를 직접 넣습니다. 반출입 오차·습득물처럼 금액이 있는 항목은 아래 금액 칸에 원 단위로 넣습니다.', '아래 「💾 저장」을 누릅니다. 저장 막대에 합계와 환산가치가 바로 계산됩니다.'] },
        { table: { head: ['성과 영역', '뜻'], rows: Object.values(CATS).map(c => [c.ic + ' ' + c.n, c.d]) } },
        { tip: '「↺ 전날 기록 불러오기」를 누르면 어제 수량이 채워집니다 — 매일 비슷한 업무는 확인만 하고 저장하세요. 같은 사업장·같은 날·같은 업종은 한 장으로 관리되어, 다시 저장하면 고쳐집니다.' }] },
      { h: '자동 성과 입력(1~100%) · 해당 업무 체크', key: ['기록하지 않은 날은 자동 산출', '인원 · 근무형태 · 산업 · 면적 기준', '성과 수준 1~100% 선택', '해당 없는 업무는 체크 해제'], img: 'm_auto', blocks: [
        { p: '하나하나 입력하지 않아도, 기록을 저장하지 않은 지난 날은 사업장 규모에 맞춘 표준 업무량으로 자동 산출되어 성과 현황·보고서에 들어갑니다. 실제와 다른 부분만 고치면 됩니다.' },
        { table: { head: ['기준', '반영 방법'], rows: [['업종별 인원', '사업장 목록의 보안·미화 인원(기타는 시설·주차·안내로 나눔) — 「업종·인원 설정」에서 바꿈'], ['근무형태', '격일제 ½ · 3조2교대 ⅔ · 4조2교대 ½ · 주간 근무는 주말 감소(산업별)'], ['산업', '병원·대학·지하철 등은 출입·방문·화장실 업무량 증가'], ['면적', '미화 관리 면적을 넣으면 일상 청소 면적 = 면적 × 성과 수준'], ['계획량', '순찰 1일 6회 등 계획이 있으면 계획 × 성과 수준'], ['성과 수준', '1~100% — 90%면 표준 업무량의 90%를 수행한 것으로 산출']] } },
        { ol: ['「✍ 일일 실적 입력」에서 사업장을 고르면 위쪽 「⚡ 자동 성과 입력」 칸에 기준(인원·근무형태)이 보입니다.', '「사용」을 켜고 성과 수준(1~100%)을 막대나 숫자로 정합니다.', '업무 칸 왼쪽 체크 — 이 사업장에 없는 업무는 체크를 해제합니다(흐리게 바뀌고 자동 입력·집계·보고서에서 빠짐).', '그 날 실제와 다르면 숫자를 고쳐 「💾 저장」 → 직접 입력 기록으로 확정됩니다. 「자동값으로 되돌리기」로 취소할 수 있습니다.', '보고서 전에는 「🖨 보고서 출력 › ✎ 출력 전 수량 조정」에서 기간 합계를 고치면 모든 출력물에 반영됩니다.'] },
        { warn: '무단침입·무단 반출입·응급환자·누수·습득물처럼 실제로 일어난 일은 자동으로 넣지 않습니다(「직접」 표시). 일어났을 때만 직접 입력하세요. 보고서에는 자동 산출 일수가 함께 표시됩니다.' }] },
      { h: '사건사고 · 작업 · 개선 · 우수사례 기록', key: ['사건사고 예방·적발(6하 원칙 · 조치결과)', '주요 작업실적 · 업무개선(작업 전·후 사진)', '교육·훈련 · 조직활성화', '근무자 우수사례·칭찬'], img: 'm_event', blocks: [
        { p: '입력 화면 아래 「📎 사건사고 · 주요 작업 · 업무개선 · 교육 · 우수사례」 칸의 버튼으로 추가합니다. 추가한 뒤 반드시 「💾 저장」을 누릅니다.' },
        { table: { head: ['종류', '적는 내용', '보고서에 들어가는 곳'], rows: [['🛑 사건사고 예방·적발', '제목 · 장소 · 근무자 · 6하 원칙 내용 · 조치결과 · 금액', '사건사고 예방·적발 내역(첨부)'], ['🧽 주요 작업실적', '제목 · 장소 · 내용 · 작업 전/후 사진', '주요 작업 및 업무개선 실적(사진표)'], ['💡 업무개선 실적', '개선 전 · 개선 후(효과) · 사진', '업무개선 및 개선효과'], ['🎓 교육·훈련', '교육명 · 대상 · 내용', '교육훈련 실적'], ['🏅 근무자 우수사례·칭찬', '대상 근무자 · 고객사 칭찬 내용', '근무자 우수사례'], ['🎉 조직활성화·행사지원', '행사명 · 참석 · 내용', '조직활성화 활동']] } },
        { warn: '사건사고의 「조치 결과」를 비워 두면 「조치 진행」으로 집계되어 SPI 안전 점수가 내려갑니다. 조치가 끝나면 그 날 기록을 열어 조치 결과를 채워 주세요.' },
        { tip: '사진은 자동으로 작게 줄여 저장합니다(긴 변 640px). 근무자 얼굴 등 개인정보가 드러나지 않게 찍어 주세요.' }] },
      { h: '성과 현황 보기 — 일일·주간·월간·연간', key: ['기간: 일일 · 주간 · 월간 · 연간', '조직 · 지사 · 산업 · 업종 · 사업장으로 좁히기', 'KPI 6개 · 추이 차트 · 항목별 표', '사업장별 SPI 순위'], img: 'm_dash', blocks: [
        { ol: ['「📈 성과 현황」 탭에서 기간(일일·주간·월간·연간)을 고릅니다.', '기준일을 바꾸거나 ◀ ▶ 로 이전·다음 기간으로 이동합니다(「오늘」로 복귀).', '조직 · 지사 · 산업 · 업종 · 사업장을 골라 범위를 좁힙니다.', '「☁ 서버 기록 받기」를 누르면 공유 서버의 다른 현장 기록까지 함께 집계합니다(권한 범위 안).'] },
        { table: { head: ['카드', '뜻'], rows: [['성과지수 SPI', '달성·품질·안전·개선·교육을 합친 점수와 등급'], ['업무 수행량', '건·회·명·대 단위 업무 합계 (㎡·kg·시간은 항목별 표에서)'], ['예방·적발 활동', '사고를 막은 활동 건수'], ['환산가치', '원으로 바꾼 가치와 연 누계'], ['계획 대비 달성률', '계획량을 넣은 항목의 달성률'], ['사건사고 예방·적발', '기록한 사건 수와 조치 상태']] } },
        { p: '「이번 기간 보이지 않는 성과」 문장은 보고서 첫 장에 그대로 들어갑니다. 업무 항목별 표는 계획 · 실적 · 달성률 · 환산가치 · 전기 실적 · 연 누계를 보여 주고, 사업장 순위에서 사업장 이름을 누르면 그 사업장만 봅니다.' }] },
      { h: '운영실태 · 품질점검', key: ['일반관리 10% · 위험관리 10%', '업무환경 5% · 현장품질 75%', '업종·산업별 체크리스트', '사업장 보고서 · 전사 종합 결과'], img: 'm_qc', blocks: [
        { ol: ['「🔍 운영실태·품질점검」 탭 → 「＋ 새 점검」.', '사업장 · 업종 · 산업(현장품질 구역이 바뀜) · 점검일 · 점검자를 넣습니다.', '항목마다 우수(100) · 양호(83.3) · 보통(66.7) · 미흡(50) · 불량(0) · 해당없음(-) 중 하나를 누르고, 오른쪽에 점검 내용·개선 요망 사항을 적습니다.', '서류를 고객사가 관리하는 등 점검할 수 없는 부문은 「점검제외」에 체크합니다(그 부문 0점 반영 — 2024 전사 보고서 방식).', '「💾 저장」 → 「📄 Word」 · 「📊 PPT」 · 「📕 PDF」로 사업장 점검보고서를 만듭니다.'] },
        { table: { head: ['부문', '배점', '점검 내용(미화 예)'], rows: [['일반관리(행정관리)', '10%', '운영매뉴얼 · 장비이력 · 약품·소모품 대장 · 업무일지 · 교육계획 · 근태'], ['위험관리(법령준수)', '10%', '비상연락망 · 위생·관리감독자교육 · 위험성평가 · MSDS · 약품 희석·라벨 · 작업자세'], ['품질관리 A(업무환경)', '5%', '사무실 · 휴게실 · 창고 · 장비 · 유니폼'], ['품질관리 B(현장품질)', '75%', '산업별 구역(병원: 외래·병실·의료폐기물 창고 등)']] } },
        { p: '왼쪽 아래 「전사 운영실태·품질점검 결과 종합」에서 연도를 고르면 90·80·70점대 분포와 평점순 표가 나오고, 종합 결과보고(Word·PDF)와 평점표(엑셀)를 만듭니다.' }] },
      { h: '보고서 출력', key: ['엑셀 실적표(르노삼성 형식)', 'Word·PDF 월말보고(미화 월말보고 형식)', 'PPT·PDF 발표자료', '전사 관리현황 · 품질점검 종합'], img: 'm_report', blocks: [
        { table: { head: ['보고서', '형식', '들어가는 내용'], rows: [['성과 실적표', '엑셀', '요약(당기·전기·누계 건수·금액) · 일자별 실적 · 사건사고 · 업무개선 · 교육 · 사업장별 · 산출기준'], ['주요 업무실적 및 계획', 'Word · PDF', '결재란 · 당월 계획/결과 · 정량 성과 · 보이지 않는 성과 · 자체 품질평가 · 차월 계획 · 작업 전·후 사진'], ['성과 발표자료', 'PPT · PDF', '표지 · 목차 · 성과 요약 · 사건사고 예방/적발 · 일상 업무 · 개선 · 교육 · 반성 및 대책 · 계획 · 붙임'], ['전사 월간실적 관리현황', '엑셀', '조직별 사업장 · 책임자 · 인원 · 보고 여부 · 업무량 · 환산가치 · SPI'], ['운영실태·품질점검 결과', 'Word · PDF · 엑셀', '목적 · 개요 · 사업유형별 · 평점순 · 후속조치']] } },
        { ol: ['「🖨 보고서 출력」 탭에서 기간 · 기준일 · 조직 · 업종 · 사업장을 고릅니다(성과 현황과 같은 범위).', 'Word 보고서의 계획·대책 문구를 직접 쓰려면 「✎ 계획·대책 문구」를 누릅니다. 비워 두면 실적으로 자동 작성합니다.', '원하는 보고서 버튼을 누르면 파일이 내려받아집니다(휴대폰은 공유 창).'] },
        { tip: '사업장을 고르지 않으면 범위 안의 기록 있는 사업장마다 한 부씩 이어서 만듭니다.' }] },
      { h: '사업장 설정 · 엑셀 일괄 입력 · 백업', key: ['사업장 산업·업종·계획량', '목록에 없는 사업장 추가', '엑셀 양식으로 한꺼번에 입력', '백업 파일 · 복원'], img: 'm_set', blocks: [
        { table: { head: ['기능', '하는 방법'], rows: [['사업장 성과 설정', '「⚙ 사업장·기준 설정」 → 사업장 고르기 → 「✎ 이 사업장 설정 열기」 → 산업 · 업종 · 면적 · 1일 계획 · 월 계획 → 저장'], ['사업장 추가', '「＋ 사업장 추가」 → 이름 · 조직 · 지사 · 산업 · 업종 · 인원 → 추가'], ['엑셀 일괄 입력', '「⬇ 입력 양식」 → 업종 시트에 일자 · 사업장명 · 항목 숫자 → 「⬆ 불러오기」'], ['백업', '「⬇ 백업 파일」로 .json 저장 → 다른 기기에서 「⬆ 복원」'], ['예시 자료', '「넣기」로 보고서 모양 미리 보기 → 「예시만 지우기」(직접 입력한 기록은 유지)']] } },
        { warn: '예시 자료의 품질점검 사업장(예시 가람병원 등)은 모두 가상입니다. 실제 고객사 점수가 아닙니다.' }] },
      { h: '자주 묻는 질문', key: ['기록은 어디에 저장되나요?', '다른 사람 기록도 보이나요?', '환산가치 기준을 바꿀 수 있나요?', '휴대폰을 잃어버렸어요'], blocks: [
        { table: { head: ['질문', '답'], rows: [['기록은 어디에 저장되나요?', '이 기기에 바로 저장되고, 로그인하면 내 계정과 회사 공유 서버에도 저장됩니다.'], ['다른 사람 기록도 보이나요?', '일반 사용자는 자기 기록과, 관리자가 지정한 담당 지사 기록만 봅니다. 제작자·관리자는 전체를 봅니다.'], ['환산가치 기준을 바꿀 수 있나요?', '「⚙ 설정 › 가치 환산 기준」에서 바꿉니다. 「추정」 값은 고객사와 협의한 값으로 바꿔 쓰세요.'], ['같은 날을 두 번 입력했어요', '같은 사업장·같은 날·같은 업종은 한 장이라 마지막 저장이 남습니다.'], ['보고서에 사진이 안 나와요', '사건·작업을 추가할 때 사진을 넣었는지, 추가 후 「💾 저장」을 눌렀는지 확인하세요.'], ['휴대폰을 잃어버렸어요', '바로 관리자에게 알리세요. 그 기기만 차단합니다.']] } }] }
    ]
  },
  admin: {
    title: '제작자 관리매뉴얼', en: 'Administrator Guide', file: '에스텍_성과관리시스템_제작자관리매뉴얼',
    sub: '권한 · 서버 · 기준값 · SPI · 품질점검 운영 · 배포 · 보안',
    sections: [
      { h: '역할과 관리 구조', key: ['통합 로그인 — 10개 프로그램 같은 서버', '제작자 · 관리자 · 사용자', '권한은 통합관리 시스템 관리 콘솔에서', '프로그램 코드 stpm'], img: 'm_launch', blocks: [
        { p: '성과 관리 시스템은 통합관리 시스템의 10번째 프로그램(코드 stpm)입니다. 계정 · 가입 승인 · 사용기한 · 기기 · 접속기록은 통합관리 시스템 「🛡️ 제작자 관리 콘솔」에서 한 번에 관리하며, 여기서 바꾼 내용은 10개 프로그램에 함께 적용됩니다.' },
        { table: { head: ['역할', '성과 관리 시스템에서'], rows: [['제작자(owner)', '모든 기능 · 공유 서버 전체 기록 보기 · 다른 사람 기록 수정/삭제'], ['관리자(admin)', '모든 기능 · 공유 서버 전체 기록 보기'], ['사용자(user)', '「프로그램별 권한」에서 stpm 「사용」을 받아야 실행 · 자기 기록 + 지정된 담당 지사 기록']] } }] },
      { h: 'Supabase 서버 준비 (완료)', key: ['server/supabase_stpm.sql', '프로그램 등록부 10번째(sort 100)', '공유 성과 기록 pm_records', '다시 실행해도 안전'], blocks: [
        { p: '통합 로그인 Supabase 프로젝트(mnsuebexlzhvomxhrear)에 2026-11-20 실행 완료했습니다. 프로그램을 새로 설치하거나 서버를 옮길 때만 SQL Editor에 다시 붙여넣고 Run 하면 됩니다(기존 자료는 지우지 않음).' },
        { table: { head: ['만드는 것', '내용'], rows: [['program_registry: stpm', '통합관리 시스템 메인 화면 10번째(맨 아래) 카드'], ['app_access', 'stpm 권한을 지정할 수 있게 허용목록 제한 해제'], ['pm_records 표', '현장 일일 기록(사업장키|업종|일자) — 표 직접 접근 차단(RLS), 함수로만 읽고 씀'], ['pm_put', '기록 올리기 — 자기 기록만 고침(관리자는 전체)'], ['pm_list', '기간 기록 받기 — 사용자: 자기 기록 + 담당 지사 / 관리자: 전체'], ['pm_delete', '삭제 — 자기 기록만(관리자는 전체)']] } },
        { tip: '확인 방법: SQL Editor에서 select code, name, sort from program_registry order by sort; → 마지막 줄이 stpm · 성과 관리 시스템 · 100' }] },
      { h: '프로그램별 권한 주기', key: ['통합관리 시스템 → 🛡️ 관리 콘솔', '🔐 프로그램별 권한 → 「성과 관리」 칸', '사용 · 사용기한 · 담당 지사', '담당 지사 = 공유 기록 조회 범위'], blocks: [
        { ol: ['통합관리 시스템 메인 → 「🛡️ 제작자 관리 콘솔」.', '「🔐 프로그램별 권한」 탭에서 사람 × 프로그램 표의 「성과 관리」 칸을 누릅니다.', '「사용」으로 바꾸고, 필요하면 사용기한과 담당 지사(동부·서부·남부·중부)를 지정합니다.', '담당 지사를 지정한 사용자는 그 지사 사업장의 공유 기록을 「☁ 서버 기록 받기」로 함께 집계합니다.'] },
        { warn: '현장 반장·소장에게는 담당 지사를 비워 두면(자기 기록만) 다른 사업장 기록이 보이지 않습니다. 지사 담당·본사 담당에게만 지사를 지정하세요.' }] },
      { h: '사업장 성과 설정 · 계획량', key: ['산업 → 업무 항목·품질 구역 결정', '업종 → 입력 탭', '1일 계획 · 월 계획 → 달성률', '계약서 과업지시서와 맞추기'], img: 'm_sitecfg', blocks: [
        { p: '계획량이 없는 항목은 실적만 집계되고 달성률·SPI의 「계획 달성」에 들어가지 않습니다. 과업지시서·고객사 요구 기준(예: 순찰 1일 6회, 직무교육 월 2시간, 화장실 점검 1일 48회)을 사업장별로 넣어 두세요.' },
        { table: { head: ['업종', '권장 계획 예'], rows: [['보안', '정기 순찰 1일 6회 · CCTV 관제 1일 24시간 · 직무교육 월 2시간(경비업법)'], ['미화', '화장실 점검 1일 48회 · 일상 청소 면적 · 산업안전보건교육 월 2시간'], ['시설', '일상 순회점검 1일 2회 · 에너지 검침 1일 1회 · 교육 월 2시간'], ['주차', '주차장 순찰 1일 4회 · 교육 월 2시간']] } }] },
      { h: '자동 성과 입력 기준(표준 업무량)', key: ['기본값: 사용 · 성과 수준 90% · 1월 1일부터', '근무자 1명당 1일 표준량 × 그날 근무 인원', '산업 보정 · 주말 비율', '출력 전 수량 조정(기간·항목별)'], blocks: [
        { p: '「⚙ 사업장·기준 설정 › ⚡ 자동 성과 입력(기본값)」에서 전체 사용 여부·기본 성과 수준·시작일을 정하고, 성과 현황 필터 범위의 사업장 수준을 한꺼번에 바꿀 수 있습니다. 계약일(사업장 목록 since) 이전은 산출하지 않습니다.' },
        { table: { head: ['항목', '근무자 1명당 1일 표준량'], rows: Object.entries(AUTO_N).slice(0, 24).map(([k, v]) => [JOBS[TASK[k].job].s + ' · ' + TASK[k].n, nf(v, 2) + ' ' + TASK[k].u]) } },
        { tip: '「✎ 출력 전 수량 조정」은 기간·항목별 배율로 저장됩니다(자동 산출분에만 적용, 직접 입력분 유지). 같은 기간을 다시 조정하면 덮어쓰고, 「이 기간 조정 지우기」로 되돌립니다.' },
        { warn: '자동 산출은 표준 업무량 기반 추정입니다. 고객사 대외 보고 전 현장 소장 확인을 거치고, 보고서의 「자동 산출」 표기를 지우지 마세요.' }] },
      { h: '가치 환산 기준 관리', key: ['1단위 환산가치(원)', '르노삼성 산출기준(보안 절전)', '「추정」 값은 협의 후 교체', '협의값은 보고서에 「고객사 협의값」 표시'], blocks: [
        { table: { head: ['항목', '기본값', '근거'], rows: Object.values(TASK).filter(t => t.v).map(t => [JOBS[t.job].s + ' · ' + t.n, nf(t.v) + '원/' + t.u, t.b || '']) } },
        { warn: '「추정」 표시 값은 시중 단가를 바탕으로 한 예시입니다. 대외 보고 전에 고객사 담당과 협의해 「⚙ 설정 › 가치 환산 기준」에서 바꾸세요. 예방 건수(시건·누수 등)는 기본 0원이며, 고객사와 합의한 기대손실액을 넣으면 금액으로 환산됩니다.' }] },
      { h: 'SPI 산식과 등급', key: ['달성 35 · 품질 25 · 안전 20', '개선 10 · 교육 10', '없는 요소는 빼고 다시 비율 계산', 'S·A·B·C 등급'], blocks: [
        { table: { head: ['요소', '가중치', '계산'], rows: [['계획 달성', '35%', '계획량 있는 항목: Σmin(실적,계획) ÷ Σ계획'], ['품질', '25%', '운영실태·품질점검(당해 연도)과 자체 품질평가 평균'], ['안전', '20%', '사건사고 중 조치 완료 비율(사건 0건이면 100)'], ['업무개선', '10%', '개선·주요 작업 건수 ÷ (사업장당 월 2건)'], ['교육', '10%', '교육 계획(월 시간) 대비 이수']] } },
        { p: '기록이 없는 요소는 빼고 나머지 가중치로 다시 나눕니다. 등급: 90점 이상 S(우수) · 80점 이상 A(양호) · 70점 이상 B(보통) · 70점 미만 C(미흡).' }] },
      { h: '자료 흐름 · 공유 서버', key: ['① 이 기기 저장', '② 계정 동기화(user_data)', '③ 공유 서버(pm_records)', '본사·지사 집계'], blocks: [
        { table: { head: ['단계', '저장 위치', '누가 보나'], rows: [['① 이 기기', '브라우저 저장소(stec_pm_data)', '그 기기'], ['② 계정 동기화', 'Supabase user_data', '같은 아이디로 로그인한 기기'], ['③ 공유 서버', 'Supabase pm_records(일일 기록)', '본인 · 담당 지사 사용자 · 관리자']] } },
        { p: '저장할 때마다 2.5초 뒤 공유 서버로 자동 업로드합니다. 화면 맨 아래 「☁ 공유 서버」 표시로 상태를 봅니다. 예전 기록을 한꺼번에 올리려면 「⚙ 설정 › ⬆ 이 기기 기록 모두 올리기」.' },
        { tip: '운영실태·품질점검 기록은 계정 동기화(②)로 저장됩니다. 전사 종합보고는 점검을 입력한 담당(본사 미화지원팀 등) 계정에서 만드세요.' }] },
      { h: '운영실태 · 품질점검 운영', key: ['연 1~2회 정기 점검', '점검제외 = 0점 반영', '사업장 보고서 배포', '미수검 사업장 관리'], blocks: [
        { ol: ['상반기 점검 계획 수립(대상 · 일정 · 점검자).', '현장 점검 — 태블릿·휴대폰으로 바로 입력, 사진은 사건·작업 기록으로 첨부.', '사업장별 점검보고서(Word·PDF)를 지사장에게 배포.', '전사 종합 결과보고(Word·PDF)와 평점표(엑셀)로 대표이사 보고.', '70점 미만 사업장은 후속조치 계획과 재점검 일정을 잡습니다.'] },
        { warn: '실제 고객사 점검 점수·사업장 평가는 공개 저장소(GitHub) 파일에 넣지 마세요. 프로그램 안에서 로그인 상태로 입력하면 계정 서버에만 저장됩니다.' }] },
      { h: '업데이트 · 배포', key: ['source/ 수정 → build.py', 'version.json 버전 올리기', 'GitHub Actions가 APK 자동 빌드', 'GitHub Pages가 웹 자동 배포'], blocks: [
        { table: { head: ['순서', '할 일'], rows: [['1', 'source/ 의 kb.js(업무 항목) · views.js(화면) · out.js(보고서) 등 수정'], ['2', 'python3 source/build.py → index.html 한 파일 생성'], ['3', 'version.json · package.json · index.html APP.version 버전 올리기'], ['4', 'main 브랜치에 올리기 → Actions 「Android APK」 약 5분 → releases/ · 릴리스 app-latest'], ['5', 'GitHub Pages(main / root)가 웹 주소에 자동 반영']] } },
        { p: '저장소: https://github.com/sadness500-boop/S-Tec-Performance-Management-System · 서명 키: android-keystore/stpm-debug.keystore(같은 키로 덮어 설치 가능)' }] },
      { h: '보안 · 개인정보 수칙', key: ['공개 저장소에 실데이터 금지', '사진에 얼굴·개인정보 주의', '공용 PC 로그아웃', '분실 기기 즉시 차단'], blocks: [
        { ul: ['저장소는 공개(Public)입니다 — 실제 고객사 점수, 근무자 개인정보, 연락처는 코드·예시 자료에 넣지 않습니다.', '사건사고 기록의 인적사항(주민번호 등)은 적지 않습니다 — 「근무자」「방문객」 등으로 표기.', '사진은 얼굴·차량번호가 드러나지 않게 촬영하거나 가립니다.', '기기 분실·퇴사자는 통합관리 시스템 관리 콘솔에서 기기 차단·계정 차단.'] }] },
      { h: '문제 해결', key: ['공유 서버 「준비 전」', '보고서가 비어 있음', '영상이 안 나옴', '앱이 예전 화면'], blocks: [
        { table: { head: ['증상', '원인 · 조치'], rows: [['☁ 공유 서버: 준비 전', 'server/supabase_stpm.sql 미실행 또는 다른 프로젝트 — SQL 재실행'], ['보고서 「기록된 실적이 없습니다」', '기간·조직·업종·사업장 범위 확인, 「☁ 서버 기록 받기」'], ['영상이 재생되지 않음', '인터넷 연결 확인(영상은 웹 주소에서 불러옴), 파일로 연 HTML은 웹 주소 영상 사용'], ['통합관리 메인에 카드가 없음', '프로그램 등록부 stpm 확인, 「프로그램별 권한」 사용 지정'], ['앱이 예전 화면', '웹은 새로고침, 앱은 APK 최신판 재설치(stpm-latest.apk)']] } }] }
    ]
  }
};

/* ---------- 매뉴얼 화면 사진 (media/manual/*.jpg — 없으면 사진 없이) ---------- */
const MAN_IMG = {};
async function manualImgs(kind) {
  const ids = [...new Set(MANUAL[kind].sections.map(s => s.img).filter(Boolean))];
  await Promise.all(ids.map(async id => {
    if (MAN_IMG[id] !== undefined) return;
    try { const r = await fetch(mediaUrl(`media/manual/${id}.jpg`)); if (!r.ok) throw 0; const b = await r.blob(); MAN_IMG[id] = await new Promise(res => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(b); }); }
    catch (e) { MAN_IMG[id] = null; }
  }));
}
const MAN_CAP = { m_main: '메인 화면 — 아이콘 · 디오라마 · 현장 영상', m_gate: '성과 담당 지정 화면', m_entry: '일일 실적 입력', m_event: '사건사고 · 작업 기록 추가', m_dash: '성과 현황(월간)', m_qc: '운영실태 · 품질점검', m_report: '보고서 출력', m_set: '사업장 · 기준 설정', m_sitecfg: '사업장 성과 설정(인원·근무형태·해당 업무·계획량)', m_auto: '자동 성과 입력(성과 수준 %) · 해당 업무 체크', m_launch: '통합관리 시스템 메인 — 10번째 카드' };

/* ---------- 매뉴얼 → 문서 블록(Word·PDF) ---------- */
function manualBlocks(kind) {
  const M = MANUAL[kind], B = [];
  B.push({ k: 'title', t: `${APP.name}\n${M.title}`, sub: `${APP.ko} ${APP.version} · ${M.en} · ${M.sub}` });
  B.push({ k: 'info', rows: [['프로그램', `${APP.name} (${APP.ko})`, '버전', `${APP.version} · ${fmtDs(kstNow())}`], ['대상', kind === 'user' ? '현장 관리자 · 지사 담당 · 영업 담당' : '제작자(owner) · 관리자(admin)', '웹 주소', APP.shareUrl]] });
  B.push({ k: 'h', t: '목 차' }); B.push({ k: 'p', t: M.sections.map((s, i) => `${i + 1}. ${s.h}`).join('\n') });
  M.sections.forEach((s, i) => {
    B.push({ k: 'pb' }); B.push({ k: 'h', t: `${i + 1}. ${s.h}` });
    B.push({ k: 'box', title: '핵심', items: s.key });
    if (s.img && MAN_IMG[s.img]) B.push({ k: 'img', src: MAN_IMG[s.img], wIn: 6.4, ratio: MAN_RATIO[s.img] || .56, caption: '▲ ' + (MAN_CAP[s.img] || '') });
    s.blocks.forEach(b => {
      if (b.p) B.push({ k: 'p', t: b.p });
      if (b.ol) B.push({ k: 'p', t: b.ol.map((x, j) => `${j + 1}) ${x}`).join('\n') });
      if (b.ul) B.push({ k: 'bullets', items: b.ul });
      if (b.table) B.push({ k: 'table', head: b.table.head, rows: b.table.rows, w: b.table.head.length === 2 ? [1.3, 4] : b.table.head.length === 3 ? [1.4, 1.2, 3.4] : undefined });
      if (b.tip) B.push({ k: 'box', title: '💡 도움말', items: [b.tip] });
      if (b.warn) B.push({ k: 'box', title: '⚠ 주의', items: [b.warn] });
    });
  });
  B.push({ k: 'p', t: `\n${APP.name} ${APP.version} — Designed & Developed by Rat Rae Choi` });
  return B;
}
const MAN_RATIO = {};
/* ---------- 매뉴얼 → 슬라이드(PPT·PDF) ---------- */
function manualSlides(kind) {
  const M = MANUAL[kind], S = []; let no = 1;
  S.push([Rc(0, 0, SW, SH, '0C2350'), Im(SW * .46, 0, SW * .54, SH, ASSET.hero, { cover: true, alpha: .9 }), Rc(.7, 1.4, .14, 1.9, C.green),
    T(1.0, 1.25, 6.5, .5, `${APP.org} · ${APP.ko}`, { size: 15, color: 'B9C3EC' }), T(1.0, 1.75, 6.5, 1.2, M.title, { size: 40, bold: true, color: 'FFFFFF' }),
    T(1.0, 2.85, 6.5, .5, `${M.en} · ${APP.version}`, { size: 16, color: 'D7DEFF' }), T(1.0, 3.5, 6.3, 1, M.sub, { size: 13, color: 'B9C3EC' }),
    Im(1.0, 5.4, 1.1, 1.1, ASSET.icon), T(2.25, 5.5, 5, .5, APP.name, { size: 14, bold: true, color: 'FFFFFF' }), T(2.25, 5.9, 5, .5, 'Designed & Developed by Rat Rae Choi', { size: 11, color: 'B9C3EC', it: true })]);
  S.push(slideBase('목 차', ++no).concat([Im(.6, 1.3, 4, 5.3, ASSET.fig.cute_sec, { contain: true }), T(5.2, 1.25, 7.6, 5.7, M.sections.map((s, i) => `${i + 1}.  ${s.h}`).join('\n'), { size: 17, color: C.ink, line: 1.45 })]));
  M.sections.forEach((s, i) => {
    const im = s.img && MAN_IMG[s.img], els = slideBase(`${i + 1}. ${s.h}`, ++no, M.title);
    els.push(Rc(.45, 1.15, im ? 5.2 : 12.45, 5.75, 'EEF7F1', { r: .1 }), T(.7, 1.25, im ? 4.8 : 12, .45, '핵심', { size: 14, bold: true, color: C.greenD }), T(.75, 1.75, im ? 4.75 : 11.9, 5.0, s.key.map(k => '✔  ' + k).join('\n'), { size: 16, color: C.ink, line: 1.55 }));
    if (im) els.push(Im(5.85, 1.15, 7.05, 5.2, im, { contain: true }), T(5.85, 6.4, 7.05, .4, '▲ ' + (MAN_CAP[s.img] || ''), { size: 10, color: C.gray, align: 'center' }));
    S.push(els);
    s.blocks.filter(b => b.table).forEach(b => {
      const n = b.table.head.length, cw = n === 2 ? [3.2, 9.25] : n === 3 ? [3, 2.2, 7.25] : b.table.head.map(() => 12.45 / n);
      S.push(slideBase(`${i + 1}. ${s.h}`, ++no, M.title).concat([Tb(.45, 1.15, 12.45, tblRows(b.table.head, b.table.rows.slice(0, 12)), cw, { size: b.table.rows.length > 7 ? 10 : 12 })]));
    });
    const tx = s.blocks.filter(b => b.ol || b.p || b.ul || b.tip || b.warn).map(b => b.ol ? b.ol.map((x, j) => `${j + 1}) ${x}`).join('\n') : b.ul ? b.ul.map(x => '• ' + x).join('\n') : b.tip ? '💡 ' + b.tip : b.warn ? '⚠ ' + b.warn : b.p).join('\n\n');
    if (tx) S.push(slideBase(`${i + 1}. ${s.h}`, ++no, M.title).concat([T(.6, 1.2, 12.2, 5.8, tx, { size: tx.length > 700 ? 12 : 14, color: C.ink, line: 1.4 })]));
  });
  return S;
}
async function outManual(kind, fmt) {
  busy(true, `${MANUAL[kind].title} 만드는 중…`);
  try {
    await manualImgs(kind);
    await Promise.all(Object.entries(MAN_IMG).filter(([k, v]) => v && !MAN_RATIO[k]).map(async ([k, v]) => { const im = await loadImg(v); MAN_RATIO[k] = im.naturalHeight / im.naturalWidth; }));
    const nm = `${MANUAL[kind].file}_${APP.version}`;
    if (fmt === 'docx') await download(await packDocx(blocksToDocx(manualBlocks(kind)), nm), nm + '.docx');
    else if (fmt === 'pptx') await download(await slidesToPptx(manualSlides(kind), nm), nm + '.pptx');
    else if (fmt === 'pptpdf') await download(await slidesToPdf(manualSlides(kind), nm), nm + '_슬라이드.pdf');
    else await download(await blocksToPdf(manualBlocks(kind), nm), nm + '.pdf');
    toast(`${MANUAL[kind].title}를 만들었습니다`);
  } catch (e) { console.error(e); toast('만들지 못했습니다: ' + (e.message || e), 5000); } finally { busy(false); }
}
/* ---------- 프로그램 안 매뉴얼 창 ---------- */
function openManual(kind) {
  const M = MANUAL[kind];
  const html = M.sections.map((s, i) => `<section id="man${i}" style="margin-bottom:18px"><h3 style="margin:0 0 6px;color:var(--nv)">${i + 1}. ${esc(s.h)}</h3><ul class="hl" style="margin-bottom:8px">${s.key.map(k => `<li>${esc(k)}</li>`).join('')}</ul>
    ${s.blocks.map(b => b.p ? `<p style="font-size:13.5px">${esc(b.p)}</p>` : b.ol ? `<ol style="font-size:13.5px;padding-left:20px">${b.ol.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : b.ul ? `<ul style="font-size:13.5px;padding-left:20px">${b.ul.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : b.table ? `<div class="tblw" style="margin:6px 0"><table class="t" style="min-width:0"><thead><tr>${b.table.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${b.table.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : b.tip ? `<p class="spiform">💡 ${esc(b.tip)}</p>` : b.warn ? `<p class="spiform" style="background:#FFF4E5">⚠ ${esc(b.warn)}</p>` : '').join('')}</section>`).join('');
  openModal(`<h2>📘 ${esc(M.title)} <small class="hint">${esc(M.en)} · ${APP.version}</small></h2><div class="sub">${esc(M.sub)}</div>
    <div class="row" style="margin-bottom:10px">${kind === 'user' ? (isAdminUser() ? '<button class="btn sm" id="mnOther">🛡️ 제작자 관리매뉴얼</button>' : '') : '<button class="btn sm" id="mnOther">👤 사용자 매뉴얼</button>'}<button class="btn sm bw" style="color:#fff;border:0" data-mf="docx">⬇ Word</button><button class="btn sm bp" style="color:#fff;border:0" data-mf="pptx">⬇ PPT</button><button class="btn sm bf" style="color:#fff;border:0" data-mf="pdf">⬇ PDF</button></div>
    <div class="row" style="margin-bottom:10px">${M.sections.map((s, i) => `<a class="chip" href="#man${i}">${i + 1}. ${esc(s.h)}</a>`).join('')}</div>
    <div style="max-height:62vh;overflow:auto;padding-right:6px">${html}</div>
    <div class="mrow"><a class="btn" href="${APP.repo}#readme" target="_blank" rel="noopener">GitHub 안내</a><button class="btn pri" id="mClose">닫기</button></div>`, md => {
    md.querySelector('#mClose').onclick = closeModal; const mo = md.querySelector('#mnOther'); if (mo) mo.onclick = () => openManual(kind === 'user' ? 'admin' : 'user');
    md.querySelectorAll('[data-mf]').forEach(b => b.onclick = () => outManual(kind, b.dataset.mf));
  }, 2);
}
