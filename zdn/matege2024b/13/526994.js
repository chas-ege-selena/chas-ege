(function() {
	retryWhileError(function() {
		NAinfo.requireApiVersion(0, 2);

		let key = '526994';
		let preference = ['two_legs', 'leg_and_hypotenuse'];
		let rand = getSelectedPreferenceFromList(key, preference);

		// Верхняя граница первого катета зависит от варианта
		let aMax = [20, 15][rand];

		let a = sl(3, aMax);
		let b = sl(3, 20);
		// Хотя бы один катет чётный - тогда объём заведомо целый
		if ((a * b) % 2 !== 0) {
			b += 1;
		}
		// Ограничиваем отношение размеров, чтобы чертёж был читаемым
		if (b > 3 * a || a > 3 * b) {
			throw new Error('bad ratio');
		}
		let h = sl(Math.max(2, Math.ceil(Math.max(a, b) / 3)), Math.min(12, 3 * Math.min(a, b)));

		// Призма с прямоугольным треугольником в основании
		let prism = new RectangularPrismWithRightAngledTriangleAtBase({
			height: h,
			sideA: a,
			sideB: b,
		});

		// Запрашиваем площадь и объём из класса (округляем для избежания погрешностей)
		let S = Math.round(prism.baseArea);
		let V = Math.round(prism.volume);

		// Гипотенуза нужна только второму варианту, но считаем один раз
		let c2 = Math.round(prism.sideC ** 2);
		let cLatex = c2.texsqrt(true);

		let textOptions = [
			`В основании прямой призмы лежит прямоугольный треугольник, катеты которого равны $${[a, b].shuffle().join('$ и $')}$. `,
			`В основании прямой призмы лежит прямоугольный треугольник, один из катетов которого равен $${a}$, а гипотенуза равна $${cLatex}$. `,
		];
		let analysOptions = [
			`Площадь прямоугольного треугольника равна половине произведения катетов: $S = \\frac{${a} \\cdot ${b}}{2} = ${S}$. `,
			`По теореме Пифагора второй катет равен $\\sqrt{${cLatex}^2 - ${a}^2} = \\sqrt{${c2} - ${a * a}} = \\sqrt{${b * b}} = ${b}$. Площадь основания: $S = \\frac{${a} \\cdot ${b}}{2} = ${S}$. `,
		];

		let text = textOptions[rand] + `Найдите объём призмы, если её высота равна $${h}$.`;
		let analys = analysOptions[rand] + `Объём призмы: $V = S \\cdot h = ${S} \\cdot ${h} = ${V}$.`;

		let paint1 = function(ctx) {
			let vertices = prism.verticesOfFigure;
			let connectionMatrix = prism.connectionMatrix;

			// Настройка камеры для проекции
			let camera = {
				x: 0,
				y: 0,
				z: 0,
				scale: 1,
				rotationX: 0.3,
				rotationY: 0.5,
				rotationZ: 0,
			};

			let v0 = vertices[0];
			let v1 = vertices[1];
			let v2 = vertices[2];

			// 3D направления вдоль катетов
			let len1 = Math.sqrt((v1.x - v0.x) ** 2 + (v1.y - v0.y) ** 2 + (v1.z - v0.z) ** 2);
			let len2 = Math.sqrt((v2.x - v0.x) ** 2 + (v2.y - v0.y) ** 2 + (v2.z - v0.z) ** 2);
			
			let dir1 = {
				x: (v1.x - v0.x) / len1,
				y: (v1.y - v0.y) / len1,
				z: (v1.z - v0.z) / len1,
			};
			let dir2 = {
				x: (v2.x - v0.x) / len2,
				y: (v2.y - v0.y) / len2,
				z: (v2.z - v0.z) / len2,
			};

			let t = 0.15 * Math.min(a, b);

			let q1 = {
				x: v0.x + t * dir1.x,
				y: v0.y + t * dir1.y,
				z: v0.z + t * dir1.z,
			};
			let q2 = {
				x: q1.x + t * dir2.x,
				y: q1.y + t * dir2.y,
				z: q1.z + t * dir2.z,
			};
			let q3 = {
				x: v0.x + t * dir2.x,
				y: v0.y + t * dir2.y,
				z: v0.z + t * dir2.z,
			};

			// Автомасштабирование: проекция 3D→2D + подбор масштаба для всех точек сразу
			let allPoints = vertices.concat([q1, q2, q3]);
			let points2D = autoScale(allPoints, camera, [], {
				startX: -180,
				finishX: 180,
				startY: -180,
				finishY: 180,
				step: 0.5,
				maxScale: 50,
			});

			ctx.translate(200, 200);
			ctx.strokeStyle = om.secondaryBrandColors.iz();
			ctx.lineWidth = 2;

			// Рисуем фигуру по матрице смежности
			ctx.drawFigure(points2D.slice(0, vertices.length), connectionMatrix);

			// Отметка прямого угла при вершине 0 основания
			let numV = vertices.length;
			let q1_2D = points2D[numV];
			let q2_2D = points2D[numV + 1];
			let q3_2D = points2D[numV + 2];

			ctx.drawLine(q1_2D.x, q1_2D.y, q2_2D.x, q2_2D.y);
			ctx.drawLine(q2_2D.x, q2_2D.y, q3_2D.x, q3_2D.y);
		};

		NAtask.setTask({
			text: text,
			analys: analys,
			answers: V,
			authors: ['Селена'],
			preference: preference,
		});
		NAtask.modifiers.addCanvasIllustration({
			width: 400,
			height: 400,
			paint: paint1,
		});
	}, 1000);
})();
// 526994 https://mathb-ege.sdamgia.ru/problem?id=526994
