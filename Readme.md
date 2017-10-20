## Useful requests
##### Get question answers by user_id
```
SELECT qq.question_text, qo.is_correct FROM `question_answers` as qa left join question_options as qo on qo.id = qa.option_id LEFT JOIN quest_questions as qq on qa.question_id = qq.id WHERE user_id = 198221472 and qo.is_correct is not null
```