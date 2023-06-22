# eVision Webcam
JS библиотека для доступа к видеопотоку web камеры и записи видео.

Модет быть использована в качестве модуля приложения.

- Просмотр видеопотока и запись видео с web камеры на десктопе или мобильном устройстве
- Переключение на заднюю или переднюю камеры на мобильном устройстве
- Скачивание видео

## Демо
**[https://webcam.evision.tech](https://webcam.evision.tech)**

## Установка

#### Загрузка через Git Clone
``` shell
git https://git.digtlab.ru/evision/evision.webcam.git
```

## Использование

#### 1. Подключение через script тег в html <head>
```html
<script type="text/javascript" src="evision-webcam.min.js"></script>
```
    или Import в javascript
``` js
import Webcam from 'evision-webcam';
```


#### 2. Размещение элемента video в HTML
```html
<video id="webcamVideo" autoplay playsinline width="640" height="480"></video>
```

#### 3. Вызов конструктора в javascript
``` js
const webcam = new Webcam(webcamVideo, 'user');
```

#### 4. Старт Webcam 
``` js
await webcam.start();
```

#### 5. Получение снимка
``` js
const picture = webcam.snap();
``` 

#### 7. Старт записи видео
``` js
webcam.startRecording();
``` 

#### 8. Стоп записи видео
``` js
const record = webcam.stopRecording();
``` 

#### 9. Остановка Webcam 
``` js
webcam.stop();
```

## Методы
- start(startStream) : запуск потока с камеры 
  - получение разрешения от пользователя
  - получение информации обо всех камерах устройства
  - выбор камеры в зависимости от режима просмотра
  - старт потока 
  
  startStream - опциональный параметр, по умолчанию true
      
- stop() : остановка видео потока 
  
- stream() : запуск видео потока 
  
- snap() : получения снимка 
  
- startRecord() : старт записи видео

- stopRecord() : остановка записи видео

## Свойства

- facingMode : 'user' или 'enviroment'
- webcamList : список всех доступных камер устройства
- webcamCount : количество доступных камер устройства