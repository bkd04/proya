/* Independent splash fallback: never allow the intro to cover the app indefinitely. */
setTimeout(function(){
  var intro = document.getElementById('splash');
  if (intro) { intro.style.opacity = '0'; intro.style.visibility = 'hidden'; intro.style.pointerEvents = 'none'; }
}, 2200);

const $ = id => document.getElementById(id);
const today = new Date();
today.setHours(0,0,0,0);
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parseKey = key => {const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d)};
const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const monthNamesGen = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const weekdays = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
let viewYear = today.getFullYear(), viewMonth = today.getMonth(), selectedDate = dateKey(today), editingId = null;
let tasks = [];
try { tasks = JSON.parse(localStorage.getItem('proyaTasks') || '[]'); } catch(e) { tasks=[]; }
function save(){try{localStorage.setItem('proyaTasks',JSON.stringify(tasks));}catch(e){}}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmtDate(key){const d=parseKey(key);const t=tr();return `${d.getDate()} ${t.monthsGen[d.getMonth()]}, ${t.days[d.getDay()]}`;}
function renderCalendar(){
  const currentTranslations = tr();
  $('weekdays').innerHTML = currentTranslations.weekdays.map(day => `<div class="weekday">${day}</div>`).join('');
  $('monthTitle').textContent=`${currentTranslations.months[viewMonth]} ${viewYear}`;
 const first=new Date(viewYear,viewMonth,1);
 const offset=(first.getDay()+6)%7;
 const start=new Date(viewYear,viewMonth,1-offset);
 const grid=$('calendarGrid');grid.innerHTML='';
 for(let i=0;i<42;i++){
  const d=new Date(start);d.setDate(start.getDate()+i);
  const key=dateKey(d), dayTasks=tasks.filter(t=>t.date===key).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
  const cell=document.createElement('button');
  cell.type='button';cell.className='day'+(d.getMonth()!==viewMonth?' outside':'')+(key===selectedDate?' selected':'')+(key===dateKey(today)?' today':'');
  cell.setAttribute('aria-label',`${fmtDate(key)}, задач: ${dayTasks.length}`);
  let content=`<span class="day-num">${d.getDate()}</span>`;
  dayTasks.slice(0,2).forEach(t=>{content+=`<span class="task-chip">${t.start?`<span class="task-time">${escapeHtml(t.start)}</span>`:'' }<span class="task-name">${escapeHtml(t.name)}</span></span>`;});
  if(dayTasks.length>2)content+=`<span class="more-tasks">${language==='en'?'+ more ':' + ещё '}${dayTasks.length-2}</span>`;
  cell.innerHTML=content;
  cell.addEventListener('click',()=>{selectedDate=key;viewYear=d.getFullYear();viewMonth=d.getMonth();render();});
  grid.appendChild(cell);
 }
}
function renderAgenda(){
 $('agendaTitle').textContent=tr().dayPlans;
 $('agendaDate').textContent=fmtDate(selectedDate);
 const list=$('taskList');
 const dayTasks=tasks.filter(t=>t.date===selectedDate).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
 list.innerHTML='';
 if(!dayTasks.length){const t=tr();list.innerHTML=`<div class="empty"><strong>${t.emptyTitle}</strong>${t.emptyText}</div>`;return;}
 dayTasks.forEach(t=>{
  const item=document.createElement('div');item.className='agenda-task'+(t.done?' completed':'');
  item.innerHTML=`<input class="check" type="checkbox" ${t.done?'checked':''} aria-label="${tr().done}"><div class="task-info"><div class="agenda-task-title">${escapeHtml(t.name)}</div>${(t.start||t.end)?`<div class="agenda-time">${t.start?escapeHtml(t.start):''}${t.end?' – '+escapeHtml(t.end):''}</div>`:'' }${t.note?`<div class="agenda-note">${escapeHtml(t.note)}</div>`:''}</div><div class="task-actions"><button class="small-btn edit" title="${tr().edit}" aria-label="${tr().edit}">✎</button><button class="small-btn delete" title="${tr().delete}" aria-label="${tr().delete}">×</button></div>`;
  item.querySelector('.check').addEventListener('change',e=>{t.done=e.target.checked;save();render();});
  item.querySelector('.edit').addEventListener('click',()=>openModal(t.id));
  item.querySelector('.delete').addEventListener('click',()=>{if(confirm(tr().deleteConfirm)){tasks=tasks.filter(x=>x.id!==t.id);save();render();toast(tr().deleted);}});
  list.appendChild(item);
 });
}
function render(){renderCalendar();renderAgenda();}

const translations = {
 ru: {
  today:'Сегодня', add:'＋ Добавить', planner:'ЛИЧНЫЙ ПЛАНИРОВЩИК', newPlan:'Новый план', editPlan:'Изменить план',
  dayPlans:'Планы на день', emptyTitle:'Пока свободно', emptyText:'Добавь план на этот день — он появится здесь и в календаре.',
  name:'Название дела *', date:'Дата', start:'Время', end:'Окончание', note:'Заметка', notePlaceholder:'Дополнительные детали...',
  namePlaceholder:'Например, закончить проект', cancel:'Отмена', save:'Сохранить план',
  deleteConfirm:'Удалить этот план?', deleted:'План удалён', saved:'Изменения сохранены', added:'План добавлен',
  badTime:'Время окончания должно быть позже времени начала.', edit:'Изменить', delete:'Удалить', done:'Отметить выполненным',
  weekdays:['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'],
  months:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
  monthsGen:['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
  days:['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота']
 },
 uk: {
  today:'Сьогодні', add:'＋ Додати', planner:'ОСОБИСТИЙ ПЛАНУВАЛЬНИК', newPlan:'Новий план', editPlan:'Змінити план',
  dayPlans:'Плани на день', emptyTitle:'Поки вільно', emptyText:'Додай план на цей день — він з’явиться тут і в календарі.',
  name:'Назва справи *', date:'Дата', start:'Час', end:'Завершення', note:'Нотатка', notePlaceholder:'Додаткові деталі...',
  namePlaceholder:'Наприклад, завершити проєкт', cancel:'Скасувати', save:'Зберегти план',
  deleteConfirm:'Видалити цей план?', deleted:'План видалено', saved:'Зміни збережено', added:'План додано',
  badTime:'Час завершення має бути пізніше часу початку.', edit:'Змінити', delete:'Видалити', done:'Позначити виконаним',
  weekdays:['ПН','ВТ','СР','ЧТ','ПТ','СБ','НД'],
  months:['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'],
  monthsGen:['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'],
  days:['неділя','понеділок','вівторок','середа','четвер','п’ятниця','субота']
 },
 en: {
  today:'Today', add:'＋ Add', planner:'PERSONAL PLANNER', newPlan:'New plan', editPlan:'Edit plan',
  dayPlans:'Plans for the day', emptyTitle:'Nothing planned yet', emptyText:'Add a plan for this day — it will appear here and on the calendar.',
  name:'Task name *', date:'Date', start:'Start time', end:'End time', note:'Note', notePlaceholder:'Additional details...',
  namePlaceholder:'For example, finish a project', cancel:'Cancel', save:'Save plan',
  deleteConfirm:'Delete this plan?', deleted:'Plan deleted', saved:'Changes saved', added:'Plan added',
  badTime:'The end time must be later than the start time.', edit:'Edit', delete:'Delete', done:'Mark as completed',
  weekdays:['MON','TUE','WED','THU','FRI','SAT','SUN'],
  months:['January','February','March','April','May','June','July','August','September','October','November','December'],
  monthsGen:['January','February','March','April','May','June','July','August','September','October','November','December'],
  days:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
 }
};
let language = 'uk';
try { language = localStorage.getItem('proyaLanguage') || 'uk'; } catch(e) { language = 'uk'; }
if (!['uk','ru','en'].includes(language)) language = 'uk';
function tr(){return translations[language] || translations.uk;}
function applyLanguage(){
 const t=tr();
 document.documentElement.lang=language;
 $('languageSelect').value=language;
 $('todayBtn').textContent=t.today;
 $('addBtn').textContent=t.add;
 $('addDayBtn').title=t.add.replace('＋ ','');
 $('addDayBtn').setAttribute('aria-label',t.add.replace('＋ ',''));
 $('todayBtn').setAttribute('aria-label',t.today);
 document.querySelector('.brand span').textContent=t.planner;
 const splashTagline=document.querySelector('.splash-tagline');
 if(splashTagline) splashTagline.innerHTML=language==='en'?'<span>not just plan.</span><span>understand your day.</span>':language==='ru'?'<span>не просто планируй.</span><span>понимай свой день.</span>':'<span>не просто плануй.</span><span>розумій свій день.</span>';
 $('agendaTitle').textContent=t.dayPlans;
 $('taskName').previousElementSibling.textContent=t.name;
 $('taskDate').previousElementSibling.textContent=t.date;
 $('taskStart').previousElementSibling.textContent=t.start;
 $('taskEnd').previousElementSibling.textContent=t.end;
 $('taskNote').previousElementSibling.textContent=t.note;
 $('taskName').placeholder=t.namePlaceholder;
 $('taskNote').placeholder=t.notePlaceholder;
 $('cancelModal').textContent=t.cancel;
 document.querySelector('#taskForm button[type="submit"]').textContent=t.save;
 $('weekdays').innerHTML=t.weekdays.map(x=>`<div class="weekday">${x}</div>`).join('');
 $('monthTitle').textContent=`${t.months[viewMonth]} ${viewYear}`;
 $('agendaDate').textContent=fmtDate(selectedDate);
 if ($('modalBackdrop').classList.contains('open')) {
   $('modalTitle').textContent=editingId?t.editPlan:t.newPlan;
 }
 render();
}
function openModal(id=null){
 editingId=id;
 $('taskForm').reset();
 $('modalTitle').textContent=id?tr().editPlan:tr().newPlan;
 if(id){const t=tasks.find(x=>x.id===id);if(!t)return;$('taskName').value=t.name;$('taskDate').value=t.date;$('taskStart').value=t.start||'';$('taskEnd').value=t.end||'';$('taskNote').value=t.note||'';}
 else{$('taskDate').value=selectedDate;$('taskStart').value='';$('taskEnd').value='';}
 document.querySelector('#taskForm button[type="submit"]').textContent=tr().save;
 $('modalBackdrop').classList.add('open');setTimeout(()=>$('taskName').focus(),60);
}
function closeModal(){$('modalBackdrop').classList.remove('open');editingId=null;}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800);}
$('addBtn').addEventListener('click',()=>openModal());
$('addDayBtn').addEventListener('click',()=>openModal());
$('prevMonth').addEventListener('click',()=>{viewMonth--;if(viewMonth<0){viewMonth=11;viewYear--;}renderCalendar();});
$('nextMonth').addEventListener('click',()=>{viewMonth++;if(viewMonth>11){viewMonth=0;viewYear++;}renderCalendar();});
$('todayBtn').addEventListener('click',()=>{selectedDate=dateKey(today);viewYear=today.getFullYear();viewMonth=today.getMonth();render();});
$('closeModal').addEventListener('click',closeModal);
$('cancelModal').addEventListener('click',closeModal);
$('modalBackdrop').addEventListener('click',e=>{if(e.target===$('modalBackdrop'))closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
$('taskForm').addEventListener('submit',e=>{
 e.preventDefault();
 const name=$('taskName').value.trim(),date=$('taskDate').value,start=$('taskStart').value,end=$('taskEnd').value;
 if(!name||!date)return;
 if(start&&end&&end<start){alert(tr().badTime);return;}
 const data={name,date,start,end,note:$('taskNote').value.trim()};
 if(editingId){const t=tasks.find(x=>x.id===editingId);if(t)Object.assign(t,data);}
 else tasks.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),...data,done:false});
 selectedDate=date;const d=parseKey(date);viewYear=d.getFullYear();viewMonth=d.getMonth();save();closeModal();render();toast(editingId?tr().saved:tr().added);
});

render();
function setLanguage(nextLanguage) {
  language = ['ru','en'].includes(nextLanguage) ? nextLanguage : 'uk';
  try { localStorage.setItem('proyaLanguage', language); } catch (err) {}
  document.documentElement.lang = language;
  // Re-render the entire calendar and agenda only AFTER changing the locale.
  // This updates the current month immediately; no need to move to another month.
  render();
  const t = tr();
  $('languageSelect').value = language;
  $('todayBtn').textContent = t.today;
  $('addBtn').textContent = t.add;
  $('addDayBtn').title = t.add.replace('＋ ', '');
  $('addDayBtn').setAttribute('aria-label', t.add.replace('＋ ', ''));
  $('todayBtn').setAttribute('aria-label', t.today);
  document.querySelector('.brand span').textContent = t.planner;
  $('agendaTitle').textContent = t.dayPlans;
  $('agendaDate').textContent = fmtDate(selectedDate);
  $('taskName').previousElementSibling.textContent = t.name;
  $('taskDate').previousElementSibling.textContent = t.date;
  $('taskStart').previousElementSibling.textContent = t.start;
  $('taskEnd').previousElementSibling.textContent = t.end;
  $('taskNote').previousElementSibling.textContent = t.note;
  $('taskName').placeholder = t.namePlaceholder;
  $('taskNote').placeholder = t.notePlaceholder;
  $('cancelModal').textContent = t.cancel;
  $('taskForm button[type="submit"]').textContent = t.save;
  $('weekdays').innerHTML = t.weekdays.map(x => `<div class="weekday">${x}</div>`).join('');
  if ($('modalBackdrop').classList.contains('open')) {
    $('modalTitle').textContent = editingId ? t.editPlan : t.newPlan;
  }
}
$('languageSelect').addEventListener('change', function() {
  setLanguage(this.value);
});
setLanguage(language);
// Splash timer is deliberately independent from the calendar/language scripts.
(function(){
  const hideSplash = function(){
    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add('hide');
      setTimeout(function(){ if (splash.parentNode) splash.parentNode.removeChild(splash); }, 800);
    }
  };
  setTimeout(hideSplash, 1800);
  window.addEventListener('load', hideSplash, { once: true });
})();
