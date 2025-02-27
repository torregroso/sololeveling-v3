import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import "./styles.css";

// Persistencia en localStorage con manejo de errores
const saveProgress = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error al guardar en localStorage:", error);
  }
};

const loadProgress = (key, defaultValue) => {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : defaultValue;
  } catch (error) {
    console.error("Error al cargar desde localStorage:", error);
    return defaultValue;
  }
};

// Función para generar las misiones del día según las reglas
function generateMissionsForToday() {
  const missions = [];
  const nowStr = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Madrid",
  });
  const today = new Date(nowStr);
  const dayOfWeek = today.getDay();

  // Misiones diarias para lunes a viernes
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    // Los martes (2) y jueves (4) no se incluyen estas dos misiones
    if (dayOfWeek !== 2 && dayOfWeek !== 4) {
      missions.push({ id: 1001, name: "2 horas de trabajo en web", xp: 25 });
      missions.push({ id: 1002, name: "1 hora de tareas de SEO", xp: 20 });
    }
    missions.push({ id: 1003, name: "15 minutos de estiramientos", xp: 5 });
    missions.push({
      id: 1004,
      name: "Fregar platos y limpiar la cocina",
      xp: 10,
    });
  }

  const referenceDate = new Date("2023-01-01T00:00:00Z");
  const diffTime = today - referenceDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays % 2 === 0) {
    missions.push({ id: 2001, name: "Orden básico de casa", xp: 10 });
  }
  if (diffDays % 3 === 0) {
    missions.push({ id: 2002, name: "Hacer la compra", xp: 15 });
  }
  if (diffDays % 25 === 0) {
    missions.push({ id: 2003, name: "Pedir cita en la peluquería", xp: 5 });
  }
  if (dayOfWeek === 0) {
    missions.push({ id: 2004, name: "Limpiar la casa profunda", xp: 30 });
  }

  if (dayOfWeek === 2 || dayOfWeek === 4) {
    missions.push({ id: 3001, name: "Hacer deporte con Bryan", xp: 20 });
  }
  if (dayOfWeek === 3) {
    missions.push({ id: 3002, name: "Hacer deporte en solitario", xp: 15 });
  }
  if (dayOfWeek === 5) {
    missions.push({ id: 3003, name: "Organizar algo con María", xp: 15 });
  }

  return missions;
}

const defaultAttributes = {
  disciplina: 0,
  organizacion: 0,
  productividad: 0,
  gestionTiempo: 0,
  habilidadTecnica: 0,
  saludFisica: 0,
  resiliencia: 0,
  bienestar: 0,
  creatividad: 0,
  lazosFamiliares: 0,
};

// Mensajes emergentes para subida y bajada de nivel
const levelUpMessages = [
  "¡Cazador, has ascendido! El sistema reconoce tu espíritu indomable y abre nuevos horizontes de poder.",
  "¡Nueva era de poder! Tu nivel se dispara y los abismos tiemblan ante tu fuerza.",
  "¡Ascenso crítico! Un rango superior se desbloquea; los portales del destino se abren para ti.",
  "¡Nivel superior alcanzado! Tus hazañas quedan grabadas en el Libro del Cazador.",
  "¡El sistema te aplaude! Has ascendido y desbloqueado potenciales ocultos que harán temblar al inframundo.",
  "¡Tu alma se fortalece! Con este nuevo nivel, hasta los demonios se rinden ante tu poder.",
  "¡Un rugido en la oscuridad! Tu evolución es palpable; el sistema reconoce tu suprema determinación.",
  "¡Evolución inminente! Nivel superior desbloqueado y el destino se inclina ante tu imparable fuerza.",
];

const levelDownMessages = [
  "¡Cazador, alerta! Has perdido nivel; el sistema exige mayor disciplina en el campo de batalla.",
  "¡Alerta en el combate! Retrocedes un escalón. Endereza tu espada y no pierdas la concentración.",
  "¡Debilidad detectada! El sistema nota la fatiga: has bajado de nivel. Reforza tu determinación.",
  "¡No es el fin, cazador! Aunque has descendido, cada tropiezo es una lección para volver más fuerte.",
  "¡El abismo se abre! Tu nivel ha caído. Recupera tu fuerza y vuelve a empuñar tu destino.",
  "¡Sombras en tu camino! La oscuridad te desafía; baja de nivel, pero la batalla aún continúa.",
  "¡Rebaja crítica! El sistema señala tu fallo en la misión. Ajusta tu estrategia y resurge.",
  "¡Fallas registradas! Has descendido de nivel. Reinicia tu plan y regresa al combate con furia renovada.",
];

// Mensajes emergentes para atributos
const attributeMessages = {
  disciplina: [
    "Disciplina +: Tu fuerza de voluntad se ha templado en el fragor del combate.",
    "¡Constancia letal! La disciplina aumenta y se convierte en tu espada y escudo.",
    "Actualización exitosa: La disciplina se refuerza, forjando un camino inflexible.",
    "¡Rigor activado! Cada misión ha pulido tu determinación hasta convertirla en ley.",
    "Disciplina optimizada: El sistema recompensa tu orden con mayor poder.",
    "¡Voluntad imparable! Tu disciplina se dispara, haciéndote invencible en la cacería.",
  ],
  organizacion: [
    "Organización +: El caos se rinde ante tu orden milimétrico.",
    "¡Estructura absoluta! La organización se eleva y cada detalle se alinea a tu favor.",
    "Actualización estratégica: Tu entorno se organiza como un arsenal perfecto.",
    "¡Orden letal! La estructura se convierte en tu arma secreta contra el desorden.",
    "Organización reforzada: El sistema optimiza cada rincón para tu victoria.",
    "¡Plan maestro activado! Tu organización transforma el caos en una táctica infalible.",
  ],
  productividad: [
    "Productividad +: Cada acción impacta como un golpe certero al sistema.",
    "¡Eficiencia brutal! La productividad aumenta y tus metas tiemblan ante tu avance.",
    "Reporte del sistema: La productividad se optimiza con cada misión cumplida.",
    "¡Ataque coordinado! Cada tarea suma poder a tu arsenal de habilidades.",
    "Productividad imparable: Tus acciones se fusionan en una fuerza devastadora.",
    "¡Impacto máximo! La eficiencia se dispara, convirtiendo cada minuto en una victoria.",
  ],
  gestionTiempo: [
    "Gestión del Tiempo +: Dominas cada segundo en el campo de batalla.",
    "¡Cronos se rinde! Tu manejo del tiempo es tan preciso como un ataque fulminante.",
    "Actualización temporal: El sistema sincroniza tus acciones para máxima eficacia.",
    "¡Reloj implacable! Cada instante se alinea en una danza mortal de precisión.",
    "Gestión perfeccionada: El tiempo se curva a tu voluntad y cada segundo cuenta.",
    "¡Temporalidad letal! Con cada tic, el sistema te acerca a la victoria.",
  ],
  habilidadTecnica: [
    "Habilidad Técnica +: Tus destrezas digitales se han afilado como una espada legendaria.",
    "¡Maestría digital! El conocimiento se incrementa y cada código se vuelve letal.",
    "Actualización del sistema: Tus habilidades técnicas se optimizan para romper barreras.",
    "¡Conocimiento mortal! La tecnología se inclina ante tu maestría en el arte digital.",
    "Habilidad técnica reforzada: Cada línea de código se transforma en un golpe certero.",
    "¡Dominio cibernético! Tu técnica se expande, convirtiéndose en tu arma secreta.",
  ],
  saludFisica: [
    "Salud Física +: Tu cuerpo se fortalece y se convierte en una muralla impenetrable.",
    "¡Estado de combate óptimo! La vitalidad se dispara, preparándote para la batalla.",
    "Actualización corpórea: El sistema potencia tu resistencia y vigor.",
    "¡Fuerza bestial! Cada ejercicio ha cincelado tu cuerpo en una armadura viva.",
    "Salud física mejorada: Tu vitalidad es ahora tan poderosa como tu espíritu.",
    "¡Energía desbordante! El poder físico fluye en ti, listo para enfrentar cualquier embate.",
  ],
  resiliencia: [
    "Resiliencia +: Cada caída te ha templado y ahora resurgirás más fuerte.",
    "¡Espíritu inquebrantable! La resiliencia aumenta y ningún golpe te detendrá.",
    "Actualización interna: El sistema convierte cada tropiezo en un peldaño hacia la gloria.",
    "¡Adversidad dominada! Tu resiliencia se eleva, transformando el dolor en poder.",
    "Resiliencia optimizada: Los desafíos se vuelven combustible para tu alma guerrera.",
    "¡Fortaleza eterna! La adversidad se rinde ante tu capacidad de recuperación.",
  ],
  bienestar: [
    "Bienestar +: Tu equilibrio interior se fortalece, dotándote de una calma imparable.",
    "¡Armonía absoluta! El bienestar crece y tu mente se vuelve un bastión de serenidad.",
    "Actualización mental: El sistema optimiza tu paz interior para la batalla.",
    "¡Equilibrio letal! Cada logro refuerza tu bienestar, preparando tu espíritu para la cacería.",
    "Bienestar incrementado: La armonía te envuelve, convirtiéndose en tu armadura emocional.",
    "¡Paz de guerrero! Tu estado interior se alinea, creando un aura invencible.",
  ],
  creatividad: [
    "Creatividad +: Tu mente estalla en ideas letales y estrategias inesperadas.",
    "¡Imaginación sin límites! La creatividad aumenta y tus planes se vuelven impredecibles.",
    "Actualización innovadora: El sistema reconoce tu potencial para forjar nuevas rutas de combate.",
    "¡Explosión de ideas! Cada pensamiento se transforma en una táctica asombrosa.",
    "Creatividad desatada: La innovación se convierte en tu arma oculta contra lo convencional.",
    "¡Genio táctico! Tus ideas revolucionarias abren caminos hacia la victoria.",
  ],
  lazosFamiliares: [
    "Lazos Familiares +: La unión con los tuyos se fortalece, impulsando tu energía vital.",
    "¡Herencia poderosa! Tus vínculos familiares se consolidan en un escudo inquebrantable.",
    "Actualización de linaje: El sistema eleva tus lazos, haciendo que tu sangre rinda homenaje a tu fuerza.",
    "¡Conexión sagrada! Cada relación familiar se convierte en un pilar de tu poder.",
    "Lazos reforzados: La fuerza de tu familia te envuelve, otorgándote un aura imparable.",
    "¡Legado eterno! Tus vínculos se elevan, haciendo que el linaje familiar sea tu mayor fortaleza.",
  ],
};

// Mensajes para castigos
const castigoMessages = [
  "¡Alerta, cazador! Has fallado en una misión: el sistema impone un castigo. Reestructura tu estrategia.",
  "El sistema detecta debilidad. Castigo activado. Endereza tu camino y vuelve a la cacería.",
  "¡Error crítico! Tu descuido ha activado la penalización. Recobra el ritmo y forja tu redención.",
  "Advertencia mortal: El sistema penaliza tu inacción. Ajusta tu táctica y demuestra tu valía.",
  "¡Sanción implacable! Tus fallos han costado puntos; la redención se alcanza con esfuerzo renovado.",
  "El castigo ha sido dictado. Las sombras se ciernen sobre ti, pero cada lección es un peldaño.",
  "¡Pena de batalla! La negligencia te ha bajado puntos. Reinicia y vuelve a empuñar tu destino.",
  "¡Castigo impuesto! La oscuridad te toca; recobra tu temple y retoma la cacería con furia.",
];

const PopupMessage = ({ message, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <p>{message}</p>
        <button onClick={onClose}>Aceptar</button>
      </div>
    </div>
  );
};

const GameContext = createContext();

const GameProviderWithPopup = ({ children }) => {
  const [popup, setPopup] = useState(null);
  const [level, setLevel] = useState(() => loadProgress("level", 1));
  const [xp, setXp] = useState(() => loadProgress("xp", 0));
  const [points, setPoints] = useState(() => loadProgress("points", 0));
  const [attributes, setAttributes] = useState(() =>
    loadProgress("attributes", defaultAttributes)
  );
  const [punishments, setPunishments] = useState(() =>
    loadProgress("punishments", [])
  );
  const [completedMissions, setCompletedMissions] = useState(() =>
    loadProgress("completedMissions", [])
  );
  const [theme, setTheme] = useState(() => loadProgress("theme", "light"));
  const [missionsDate, setMissionsDate] = useState(() =>
    loadProgress("missionsDate", "")
  );
  const [missions, setMissions] = useState(() => loadProgress("missions", []));

  const getTodayStr = () => {
    const nowStr = new Date().toLocaleString("en-US", {
      timeZone: "Europe/Madrid",
    });
    const today = new Date(nowStr);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Al montar la app, si la fecha almacenada es anterior a la actual, se procesan las misiones pendientes.
  useEffect(() => {
    const todayStr = getTodayStr();
    if (missionsDate && missionsDate !== todayStr) {
      processPendingMissions(todayStr);
    }
  }, []);

  // Función para procesar misiones pendientes (aplicar penalización, asignar castigos, ajustar XP y nivel)
  const processPendingMissions = (todayStr) => {
    let totalPenalty = 0;
    const punishmentsToAdd = [];
    missions.forEach((mission) => {
      totalPenalty += mission.xp;
      const punishmentText =
        castigoMessages[Math.floor(Math.random() * castigoMessages.length)];
      punishmentsToAdd.push(punishmentText);
    });
    const totalXP = (level - 1) * 100 + xp;
    let newTotalXP = totalXP - totalPenalty;
    if (newTotalXP < 0) newTotalXP = 0;
    const newLevel = Math.floor(newTotalXP / 100) + 1;
    const newXp = newTotalXP % 100;
    const levelDrop = level - newLevel;
    const newDiscipline = Math.max(attributes.disciplina - levelDrop, 0);
    if (!popup) {
      if (newLevel > level) {
        const msg =
          levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)];
        setPopup(msg);
      } else if (newLevel < level) {
        const msg =
          levelDownMessages[
            Math.floor(Math.random() * levelDownMessages.length)
          ];
        setPopup(msg);
      }
    }
    setXp(newXp);
    setLevel(newLevel);
    setAttributes((prev) => ({ ...prev, disciplina: newDiscipline }));
    setPunishments((prev) => [...prev, ...punishmentsToAdd]);
    const newMissions = generateMissionsForToday();
    setMissions(newMissions);
    setMissionsDate(todayStr);
    saveProgress("missions", newMissions);
    saveProgress("missionsDate", todayStr);
  };

  // Programar timeout para procesar el cambio de día (a medianoche, en la zona de España)
  useEffect(() => {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" })
    );
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeToMidnight = tomorrow - now;
    const timeout = setTimeout(() => {
      processPendingMissions(getTodayStr());
      setInterval(
        () => processPendingMissions(getTodayStr()),
        24 * 60 * 60 * 1000
      );
    }, timeToMidnight);
    return () => clearTimeout(timeout);
  }, [missions, level, xp, attributes, missionsDate, popup]);

  // Efecto para limpiar del localStorage las misiones y castigos cada 15 días.
  useEffect(() => {
    const now = new Date();
    const lastCleanup = localStorage.getItem("lastCleanup");
    if (lastCleanup) {
      const lastCleanupDate = new Date(lastCleanup);
      const diffDays = (now - lastCleanupDate) / (1000 * 60 * 60 * 24);
      if (diffDays >= 15) {
        localStorage.removeItem("missions");
        localStorage.removeItem("missionsDate");
        localStorage.removeItem("punishments");
        setMissions(generateMissionsForToday());
        setMissionsDate(getTodayStr());
        setPunishments([]);
        localStorage.setItem("lastCleanup", now.toISOString());
      }
    } else {
      localStorage.setItem("lastCleanup", now.toISOString());
    }
  }, []);

  useEffect(() => {
    saveProgress("level", level);
    saveProgress("xp", xp);
    saveProgress("points", points);
    saveProgress("attributes", attributes);
    saveProgress("punishments", punishments);
    saveProgress("missions", missions);
    saveProgress("completedMissions", completedMissions);
    saveProgress("theme", theme);
    saveProgress("missionsDate", missionsDate);
  }, [
    level,
    xp,
    points,
    attributes,
    punishments,
    missions,
    completedMissions,
    theme,
    missionsDate,
  ]);

  const completeMission = (mission) => {
    let newXp = xp + mission.xp;
    let newPoints = points;
    let newLevel = level;
    while (newXp >= newLevel * 100) {
      newXp -= newLevel * 100;
      newLevel++;
      newPoints += newLevel;
    }
    if (!popup && newLevel > level) {
      const msg =
        levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)];
      setPopup(msg);
    }
    setXp(newXp);
    setLevel(newLevel);
    setPoints(newPoints);
    const entry = {
      id: Date.now(),
      name: mission.name,
      xp: mission.xp,
      timestamp: new Date().toISOString(),
    };
    setCompletedMissions([...completedMissions, entry]);
    setMissions(missions.filter((m) => m.id !== mission.id));
  };

  const upgradeAttribute = (attr) => {
    if (points > 0) {
      setAttributes((prev) => ({ ...prev, [attr]: prev[attr] + 1 }));
      setPoints(points - 1);
      if (!popup) {
        const messages = attributeMessages[attr] || [`${attr} incrementado.`];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        setPopup(msg);
      }
    }
  };

  const resetProgress = () => {
    const todayStr = getTodayStr();
    const newMissions = generateMissionsForToday();
    setLevel(1);
    setXp(0);
    setPoints(0);
    setAttributes(defaultAttributes);
    setPunishments([]);
    setCompletedMissions([]);
    setMissions(newMissions);
    setMissionsDate(todayStr);
    localStorage.clear();
    saveProgress("missions", newMissions);
    saveProgress("missionsDate", todayStr);
    setPopup(
      "¡Todos los datos han sido reiniciados! Prepárate para comenzar de nuevo."
    );
  };

  const contextValue = {
    level,
    xp,
    points,
    attributes,
    punishments,
    missions,
    completedMissions,
    theme,
    completeMission,
    upgradeAttribute,
    resetProgress,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
      {popup && <PopupMessage message={popup} onClose={() => setPopup(null)} />}
    </GameContext.Provider>
  );
};

const useGame = () => useContext(GameContext);

// Componentes de la aplicación

const CalendarClock = () => {
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const options = {
        timeZone: "Europe/Madrid",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      const now = new Date().toLocaleString("es-ES", options);
      setCurrentTime(now);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  return <div className="calendar-clock">{currentTime}</div>;
};

const Header = () => (
  <header className="header">
    <CalendarClock />
    <NavBar />
  </header>
);

const NavBar = () => (
  <nav className="navbar">
    <Link to="/dashboard">Sistema Leveling</Link>
    <Link to="/missions">Misiones</Link>
    <Link to="/attributes">Atributos</Link>
    <Link to="/punishments">Zona de Castigos</Link>
    <Link to="/reset">Reiniciar Datos</Link>
  </nav>
);

const Dashboard = () => {
  const { level, xp, points, attributes, theme } = useGame();
  const xpToNextLevel = level * 100;
  return (
    <div className="page">
      <h1>Sistema Leveling</h1>
      <div className={`dashboard ${theme}`}>
        <div className="stats">
          <h2>Estadísticas</h2>
          <p>Nivel: {level}</p>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${(xp / xpToNextLevel) * 100}%` }}
            ></div>
          </div>
          <p>
            XP: {xp} / {xpToNextLevel}
          </p>
          <p>Puntos: {points}</p>
        </div>
        <div className="attributes-summary">
          <p>Disciplina: {attributes.disciplina}</p>
          <p>Organización: {attributes.organizacion}</p>
          <p>Productividad: {attributes.productividad}</p>
          <p>Gestión del Tiempo: {attributes.gestionTiempo}</p>
          <p>Habilidad Técnica: {attributes.habilidadTecnica}</p>
          <p>Salud Física: {attributes.saludFisica}</p>
          <p>Resiliencia: {attributes.resiliencia}</p>
          <p>Bienestar: {attributes.bienestar}</p>
          <p>Creatividad: {attributes.creatividad}</p>
          <p>Lazos Familiares: {attributes.lazosFamiliares}</p>
        </div>
      </div>
    </div>
  );
};

const Missions = () => {
  const { missions, completeMission, theme } = useGame();
  if (missions.length === 0) {
    return (
      <div className="page">
        <h2>Misiones diarias completadas</h2>
      </div>
    );
  }
  return (
    <div className="page">
      <h2>Misiones Diarias</h2>
      <ul className={`mission-list ${theme}`}>
        {missions.map((mission) => (
          <li key={mission.id} className="mission-card">
            <span>{mission.name}</span>
            <span>+{mission.xp} XP</span>
            <button onClick={() => completeMission(mission)}>Completada</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Attributes = () => {
  const { attributes, upgradeAttribute, points, theme } = useGame();
  return (
    <div className="page">
      <h2>Mejorar Atributos</h2>
      <div className={`attributes ${theme}`}>
        <p>
          Disciplina: {attributes.disciplina}{" "}
          <button
            onClick={() => upgradeAttribute("disciplina")}
            disabled={points === 0}
          >
            +
          </button>
        </p>
        <p>
          Organización: {attributes.organizacion}{" "}
          <button
            onClick={() => upgradeAttribute("organizacion")}
            disabled={points === 0}
          >
            +
          </button>
        </p>
        <p>
          Productividad: {attributes.productividad}{" "}
          <button
            onClick={() => upgradeAttribute("productividad")}
            disabled={points === 0}
          >
            +
          </button>
        </p>
        <p>
          Gestión del Tiempo: {attributes.gestionTiempo}{" "}
          <button
            onClick={() => upgradeAttribute("gestionTiempo")}
            disabled={points === 0}
          >
            +
          </button>
        </p>
        <p>
          Habilidad Técnica: {attributes.habilidadTecnica}{" "}
          <button
            onClick={() => upgradeAttribute("habilidadTecnica")}
            disabled={points === 0}
          >
            +
          </button>
        </p>
        <p>
          Salud Física: {attributes.saludFisica}{" "}
          <button
            onClick={() => upgradeAttribute("saludFisica")}
            disabled={points === 0}
          >
            +
          </button>
        </p>
        <p>
          Resiliencia: {attributes.resiliencia}{" "}
          <button
            onClick={() => upgradeAttribute("resiliencia")}
            disabled={points === 0}
          >
            +
          </button>
        </p>
        <p>
          Bienestar: {attributes.bienestar}{" "}
          <button
            onClick={() => upgradeAttribute("bienestar")}
            disabled={points === 0}
          >
            +
          </button>
        </p>
        <p>
          Creatividad: {attributes.creatividad}{" "}
          <button
            onClick={() => upgradeAttribute("creatividad")}
            disabled={points === 0}
          >
            +
          </button>
        </p>
        <p>
          Lazos Familiares: {attributes.lazosFamiliares}{" "}
          <button
            onClick={() => upgradeAttribute("lazosFamiliares")}
            disabled={points === 0}
          >
            +
          </button>
        </p>
      </div>
    </div>
  );
};

const Punishments = () => {
  const { punishments, theme } = useGame();
  return (
    <div className="page">
      <h2>Zona de Castigos</h2>
      {punishments.length > 0 ? (
        <ul className={`punishment-list ${theme}`}>
          {punishments.map((p, index) => (
            <li key={index}>{p}</li>
          ))}
        </ul>
      ) : (
        <p>El sistema informa: No se han registrado castigos.</p>
      )}
    </div>
  );
};

const ResetData = () => {
  const { resetProgress } = useGame();
  return (
    <div className="page">
      <h2>Reiniciar Datos</h2>
      <p>
        Esta acción borrará y reiniciará todos tus datos guardados, incluyendo
        las misiones diarias.
      </p>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="page home">
      <h1>Bienvenido a Solo Leveling - Productividad</h1>
      <button onClick={() => navigate("/dashboard")}>Comenzar</button>
    </div>
  );
};

export default function App() {
  return (
    <GameProviderWithPopup>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/attributes" element={<Attributes />} />
          <Route path="/punishments" element={<Punishments />} />
          <Route path="/reset" element={<ResetData />} />
        </Routes>
      </BrowserRouter>
    </GameProviderWithPopup>
  );
}
