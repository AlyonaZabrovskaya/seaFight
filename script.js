const myCanvas = document.getElementById("myCanvas");
const opponentCanvas = document.getElementById("opponentCanvas");
const myContext = myCanvas.getContext("2d");
const opponentContext = opponentCanvas.getContext("2d");
const buttonPlay = document.getElementById("puskPlay");
const newPlay = document.getElementById("newPlay");
const text = document.getElementById("text");
const text1 = document.getElementById("text1");
const text2 = document.getElementById("text2");
const gameResult = document.getElementById("gameResult");
const containerButton = document.getElementById("containerButton");//контейнер с кнопками
const victory = document.getElementById("victory");//фото в случае выигрыша
const defeat = document.getElementById("defeat");//фото в случае проишрыша
const typeShips = [4,3,3,2,2,2,1,1,1,1];//палубы
let shipIndex = 0;//какой рисуется корабль
let rows = 11;//количество строк массива
let cols = 11;//количество столбцов массива
let field = [];//определяем пустой массив - сетку поля
let gameOn = true;//переменная, указывающая продолжается ли игра
let v = true;//переменная попадания по кораблю противника
let motion = false;//неудачная попытка
let a = false;//неудачный ход оппонента
let placeShip;
let placeShipWidth;
let locatedShipWidth;
let locatedShipHeight;
let placeShipHeight;
let arrayAllShips = [];//массив собственных кораблей
let arrayOpponentShips = [];//массив кораблей оппонента
let checkedShip = true;//переменная - разрешение добавления кораблика
let orientation = true;//переменная ориентации кораблика
let allOptions = [];// массив всех ходов
let numberOfStrokes = 0;//количество возможных ударов по кораблику
let hitOpponent = 0;//попадания врага
let myHits = 0;//собственные попадания

for (let q=1; q<11; q++)//делаем 10 строк - параметр х
{	
	field[q] = [];//в каждую строку массива добавляем еще массив-столбец - параметр у
	for (let w=1; w<11; w++)//делаем 10 столбцов
	{
		allOptions.push([q, w]);//добавляем в массив пару значений хода
	}
} 

for (let i=0; i<rows; i++)//сгенерировать 10 строк
{
	field[i] = [];//в каждую строку массива добавляем еще массив-столбец
	for (let j=0; j<cols; j++)//сгенерировать 10 столбцов
	{
		field[i][j] = undefined;//пустые значения "сетки координат"
	}
}


function soundStep(src)//функция звукового сопровоождения
{
  let audio = new Audio(); // Создаём новый элемент Audio
  audio.src = src; // Указываем путь к звуку "клика"
  audio.autoplay = true; // Автоматически запускаем
}
const letterСolumn = ["А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К"];
const numberRow = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
function grid(context)//функция отрисовки сетки на поле
{
	context.beginPath();//начало пути отрисовки линии
	context.lineWidth = "1";//установка толщины линии
	context.strokeStyle = "#000000";//цвет линии
	for (let a=1; a<11; a++)//отрисовка горизонтальных линий
	{
		context.beginPath();//начало пути отрисовки линии
		context.moveTo(0, a*50);//метод перемещает на координату начала линии
		context.lineTo(550, a*50);//метод отрисовки линии с координатами конца
		context.stroke();//отображение пути
		if(a===1)
		{
			context.save();
			context.strokeStyle = "#eb6680";
			context.lineWidth = "5";//установка толщины линии
			context.stroke(); // рисуем выделенную линию
			context.restore();
		}
		else 
		{
			context.stroke();//отображение пути
		}
	context.font = "30px Verdana";
	context.fillStyle = "#eb6680";
		for (let i=0; i<letterСolumn.length; i++)
		{
			context.fillText(letterСolumn[i], i * 50 + 65, 35);
			context.strokeText(letterСolumn[i], i * 50 + 65, 35);
		}
	}
			
	for (let b=1; b<11; b++)//отрисовка вертикальных линий
	{
		context.beginPath();//начало пути отрисовки линии
		context.moveTo(b*50, 0);//метод перемещает на координату начала линии
		context.lineTo(b*50, 550);//метод отрисовки линии с координатами конца
		context.stroke();//отображение пути
		if(b===1)
		{
			context.save();
			context.strokeStyle = "#eb6680";
			context.lineWidth = "5";//установка толщины линии
			context.stroke(); // рисуем выделенную линию
			context.restore();
		}
		else 
		{
			context.stroke();//отображение пути
		}
		context.font = "30px Verdana";
		context.fillStyle = "#eb6680";
		for (let p=0; p<numberRow.length; p++)
		{
			context.fillText(numberRow[p], 10, p * 50 + 80);
			context.strokeText(numberRow[p],10, p * 50 + 80);
		}
	}		
}
grid(myContext);//вызов функции отрисовки сетки на поле
buttonPlay.addEventListener("click", ()=>//обработчик события "клик по кнопке "в бой" "
{
	shipIndex = 0;  
	arrayOpponentShips = [];
	shipGeneration();
	grid(opponentContext);//функция отрисовки сетки на поле противника
	opponentCanvas.style.display = "block";//отображение поля противника
	text2.style.display = "block";//отображение текста над полем противника
	containerButton.style.display = "none";
	soundStep('audio5.mp3');
})

newPlay.addEventListener("click", ()=>//обработчик события "клик по кнопке "новая игра" "
{
	history.go(0);//перезагрузка текущей страницы
	soundStep('audio5.mp3');	
})

function CanvasCoordinat(canvas, x, y)//функция определения сектора на канве
{
	let RectBounding = canvas.getBoundingClientRect();//канва как область просмотра, отдельная от всего документа
	let coordinatX = Math.floor((x-RectBounding.x)/50); 
	let coordinatY = Math.floor((y-RectBounding.y)/50);
	return {x: coordinatX, y: coordinatY};
}

function fitOnCanvas(placeShip, shipSize, orientation)//функция проверки: помещается ли кораблик на канву
{
	if(orientation)
	{
		let shipWidth = placeShip.x + shipSize - 1;
		let shipHeight = 1;
		if(placeShip.x > 0 && shipWidth < cols && placeShip.y > 0 && placeShip.y < rows )
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	else
	{
		let shipWidth = 1;
		let shipHeight = placeShip.y + shipSize - 1;
		if(placeShip.y > 0 && shipHeight < rows && placeShip.x > 0 && placeShip.x < cols)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
}

myCanvas.addEventListener("mouseup", function(e)//функция расстановки корабликов
{
	let location = CanvasCoordinat(myCanvas, e.clientX, e.clientY);//переменная - местоположения курсора мыши на канве
	let shipSize = typeShips[shipIndex];
  if(fitOnCanvas(location, shipSize, orientation) == true)
  {
    if(shipIndex < typeShips.length && checkedShip)
    {	
    	if(e.button === 0)//если левый клик мыши
    	{
				locationShip(myContext, location.x, location.y, shipSize, orientation);	
				soundStep('audio4.mp3');
				let newDecksShips = new NewShips(location.x, location.y, shipSize, orientation);
				arrayAllShips.push(newDecksShips);
        shipIndex++; // перебираем корабли по массиву
    	}
    	myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);//очистка канвы
       grid(myContext);//перерисовка моего поля
       arrayAllShips.forEach(ship => locationShip(myContext, ship.x, ship.y, ship.f, ship.o, ship.n));//отрисовка массива кораблей
    }	
  }
  if(arrayAllShips.length == 10)
  {
		containerButton.style.display = "block";//прячем кнопку  "в бой"
  }
});

myCanvas.addEventListener("wheel", function(e)//колёсиком мыши меняем оринтацию кораблика
{
	orientation = !orientation;//вертикальный кораблик
	drawingShips(e);
});

function checkPlaceShips(placeShip, locatedShip)//функция проверки столкновения
{	
	if(locatedShip.o)
	{
		locatedShipWidth = locatedShip.f;
		locatedShipHeight = 1;
	}
	else
	{
		locatedShipWidth = 1;
		locatedShipHeight = locatedShip.f;
	}

	if(placeShip.o)
	{
		placeShipWidth = placeShip.f;
		placeShipHeight = 1;
	}
	else
	{
		placeShipWidth = 1;
		placeShipHeight = placeShip.f;
	}

	if(placeShip.x + placeShipWidth < locatedShip.x ||
	   placeShip.x > locatedShip.x + locatedShipWidth ||
	   placeShip.y + placeShipHeight < locatedShip.y ||
	   placeShip.y > locatedShip.y + locatedShipHeight)
	{
		return true;
	}
	else
	{
		return false;
	}
}

function drawingShips(e)//функция отрисовки кораблей
{
	let location = CanvasCoordinat(myCanvas, e.clientX, e.clientY);//переменная - местоположения курсора мыши на канве
	let shipSize = typeShips[shipIndex];
	if(fitOnCanvas(location, shipSize, orientation) == true)
	{
		myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);//очистка канвы
    grid(myContext);//перерисовка моего поля
    arrayAllShips.forEach(ship => locationShip(myContext, ship.x, ship.y, ship.f, ship.o, ship.n));//перебор моего массива кораблей и их отрисовка
    checkedShip = true
    placeShip = {x: location.x, y: location.y, f: shipSize, o: orientation};
		for (let q=0; q<arrayAllShips.length; q++)
		{
			if(checkPlaceShips(placeShip, arrayAllShips[q]) == false)
			{
				checkedShip = false;
				break;
			}
		}

		if(checkedShip == true)
		{
			locationShip(myContext, location.x, location.y, shipSize, orientation, "green");
		}
		else
		{
			locationShip(myContext, location.x, location.y, shipSize, orientation, "red");
		}
	}
}

myCanvas.addEventListener("mousemove", drawingShips);//отрисовка кораблей по полю в момент их расстановки
 
function NewShips(locationX, locationY, shipSize, orientation, color) //функция-конструктор объектов-кораблей
{
  this.x = locationX;
  this.y = locationY;
  this.f = shipSize;
  this.o = orientation;
  this.c = color;
  this.numberOfStrokes = shipSize;
}

function locationShip(context, x,y,f,o, color = "#1079c1")//функция отрисовки корабликов
{
	context.strokeStyle = color;
	context.lineWidth = "4";
	if(o === true)
	{		
		context.beginPath();//начало пути отрисовки линии
		context.moveTo(x * 50, y * 50 + 25);//метод перемещает на координату начала линии
		context.lineTo(x * 50 + f * 12.5, y * 50);//отрисовка линии с координатами конца
		context.moveTo(x * 50, y * 50 + 25);//метод перемещает на координату начала линии
		context.lineTo(x * 50 + f * 12.5, y * 50 + 50);//отрисовка линии с координатами конца
		context.moveTo(x * 50 + f * 12.5, y * 50);//метод перемещает на координату начала линии
		context.lineTo(x * 50 + f * 37.5, y * 50);//отрисовка линии с координатами конца
		context.moveTo(x * 50 + f * 37.5, y * 50);//метод перемещает на координату начала линии
		context.lineTo(x * 50 + f * 50, y * 50 + 25);//отрисовка линии с координатами конца
		context.moveTo(x * 50 + f * 50, y * 50 + 25);//метод перемещает на координату начала линии
		context.lineTo(x * 50 + f * 37.5, y * 50 + 50);//отрисовка линии с координатами конца
		context.moveTo(x * 50 + f * 37.5, y * 50 + 50);//метод перемещает на координату начала линии
		context.lineTo(x * 50 + f * 12.5, y * 50 + 50);//отрисовка линии с координатами конца
		context.stroke();//отображение пути
	}
	if(o === false)
	{		
		context.beginPath();//начало пути отрисовки линии
		context.moveTo(x * 50 + 25, y * 50);//метод перемещает на координату начала линии
		context.lineTo(x * 50, y * 50 + f * 12.5);//отрисовка линии с координатами конца
		context.moveTo(x * 50 + 25, y * 50);//метод перемещает на координату начала линии
		context.lineTo(x * 50 + 50, y * 50 + f * 12.5);//отрисовка линии с координатами конца
		context.moveTo(x * 50, y * 50 + f * 12.5);//метод перемещает на координату начала линии
		context.lineTo(x * 50, y * 50 + f * 37.5);//отрисовка линии с координатами конца
		context.moveTo(x * 50, y * 50 + f * 37.5);//метод перемещает на координату начала линии
		context.lineTo(x * 50 + 25, y * 50 + f * 50);//отрисовка линии с координатами конца
		context.moveTo(x * 50 + 25 , y * 50 + f * 50);//метод перемещает на координату начала линии
		context.lineTo(x * 50 + 50, y * 50 + f * 37.5);//отрисовка линии с координатами конца
		context.moveTo(x * 50 + 50, y * 50 + f * 37.5);//метод перемещает на координату начала линии
		context.lineTo(x * 50 + 50, y * 50 + f * 12.5);//отрисовка линии с координатами конца
		context.stroke();//отображение пути
	}
}

function checkHits(stepX,stepY,array,context,w)//функция проверки результата хода
{
	motion = false;
	for(let i=0; i<array.length; i++)
	{
		if(array[i].o == true)
		{
			if(array[i].x <= stepX  && stepX <= array[i].x + array[i].f - 1 && stepY === array[i].y)
			{		
				motion = true;
    	}
		}

		if(array[i].o == false)
    	{
				if(array[i].y <= stepY  && stepY <= array[i].y + array[i].f - 1 && stepX === array[i].x)
				{		
					motion = true;
    		}
    	}

		if(motion == true)
		{
			array[i].numberOfStrokes--;//удаляем количество возможных попаданий из ранянного кораблика
			hittingTheEnemy(stepX, stepY, context);//попадание
			w = true;
			if(array[i].numberOfStrokes == 0)
			{
				locationShip(context, array[i].x, array[i].y, array[i].f, array[i].o, "#d11a3e");
				soundStep('audio3.mp3');
			}
			break;
		}
	}
	if(motion == false)
	{
		badShot(stepX, stepY, context);//не попадание
		w = false;
	}
}

opponentCanvas.addEventListener("mousedown", function(e)//функция ударов по полю соперника
{
	if(v==true)
	{
    let location = CanvasCoordinat(opponentCanvas, e.clientX, e.clientY);//переменная - местоположения курсора мыши на канве
    if (location.x < cols && location.y < rows && location.x !== 0 && location.y !== 0)//клик внутри клеток
    {
    	checkHits(location.x,location.y,arrayOpponentShips,opponentContext,v);
			if(v == true)
    	{
				myHits++;
			}
			if(v == false)
    	{
				setTimeout(enemyStrike, 2000);
			}
			if(myHits == 20)
			{
				setTimeout(result, 1000);
			}				
    }
  }
 });

function hittingTheEnemy(x,y, context)//функция попадания по кораблю противника
{
	context.beginPath();//начало пути отрисовки линии
	context.strokeStyle = "#eb6680";
	context.lineWidth = 4;
	context.moveTo(x*50, y*50);
	context.lineTo(x*50 + 50, y*50 + 50);
	context.moveTo(x*50, y*50 + 50);
	context.lineTo(x*50 + 50, y*50);
	context.stroke();//отображение пути
	soundStep('audio2.mp3');
	if(v == false)
	{
		a = true;
		setTimeout(enemyStrike, 2000);
	}
}

function badShot(x,y, context)//функция холостого удара
{
	context.beginPath();//начало пути отрисовки линии
	context.strokeStyle = "#69bdf7";
	context.lineWidth = 4;
	context.arc(x*50+25, y*50+25, 5, 0, Math.PI*2,false);//отрисовка линии с координатами конца
	context.stroke();//отображение пути
	v = !v;//ход переходит сопернику	
	soundStep('audio1.mp3');
}

function shipGeneration()//функция генерации кораблей
{
	while(shipIndex < typeShips.length)
	{
		let shipSize = typeShips[shipIndex];
		let orientationShips = Math.random();
    orientation = orientationShips >= 0.5;
    let min = 0;
    let max = 9;
   	let stepX = Math.floor(Math.random() * (max - min + 1)) + min;
    let stepY = Math.floor(Math.random() * (max - min + 1)) + min;
    placeShip = {x: stepX, y: stepY, f: shipSize, o: orientation};
    let newOpponentShips = new NewShips(stepX, stepY, shipSize, orientation);//создаем новый объект - кораблик
		if(fitOnCanvas(placeShip, shipSize, orientation) == true)//если кораблик умещается на канву
		{
			if(arrayOpponentShips.length == 0)
			{
				arrayOpponentShips.push(newOpponentShips);
				shipIndex++;
			}
			else
			{
				let cheked = true;
				for(let i=0; i<arrayOpponentShips.length; i++)
				{
					if(checkPlaceShips(placeShip, arrayOpponentShips[i]) == false)
					{
						cheked = false;
						break;
					}
				}
				if(cheked)
				{
					arrayOpponentShips.push(newOpponentShips);//добавляем кораблик в массив кораблей оппонента
					shipIndex++;
				}
			}	
		}   
	}
}

function enemyStrike()//функция "вражеский удар"
{
	a = false;  
	let max = allOptions.length-1;//максимальное значение хода
	let generateStep = Math.floor(Math.random() * max);//рандомное число, входящее в масcив вариантов
	let [stepX, stepY] = allOptions[generateStep];//параметры как значения всех вариантов хода
	checkHits(stepX,stepY,arrayAllShips,myContext,a);
	allOptions.splice(generateStep, 1);
	if(a == true)
	{
		hitOpponent++;
		v = false;
	}	
	if(hitOpponent == 20)
	{
		setTimeout(result, 1000);
	}
}	

function result()//функция отображения результат игры
{
	text.style.display = "none";
	gameOn = false;

	if(hitOpponent == 20)
	{
		defeat.style.display = "block";
	}

	if(myHits == 20)
	{
		victory.style.display = "block";
	}
	containerButton.style.display = "block";
	buttonPlay.style.display = "none";
	newPlay.style.display = "block";
}