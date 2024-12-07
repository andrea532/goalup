import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

// Componente per l'inserimento di obiettivi dettagliati
const GoalModal = ({ isOpen, onClose, onAddGoal, timeframe }) => {
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalProgress, setGoalProgress] = useState(0);

  const handleAddGoal = () => {
    if (goalTitle.trim()) {
      onAddGoal({
        title: goalTitle,
        description: goalDescription,
        progress: goalProgress,
        timeframe: timeframe
      });
      // Reset dei campi
      setGoalTitle('');
      setGoalDescription('');
      setGoalProgress(0);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Nuovo Obiettivo {timeframe}</h2>
        
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Titolo Obiettivo</label>
          <Input 
            placeholder={`Inserisci obiettivo per ${timeframe}`}
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Descrizione</label>
          <Textarea 
            placeholder="Descrivi dettagliatamente l'obiettivo"
            value={goalDescription}
            onChange={(e) => setGoalDescription(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Progresso (%)</label>
          <Input 
            type="number"
            min="0"
            max="100"
            value={goalProgress}
            onChange={(e) => setGoalProgress(Number(e.target.value))}
            placeholder="Inserisci percentuale di progresso"
          />
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={handleAddGoal}>Aggiungi Obiettivo</Button>
        </div>
      </div>
    </div>
  );
};

// Componente principale dell'app di obiettivi
const GoalTrackingApp = () => {
  const [goals, setGoals] = useState({
    tenYear: [],
    fiveYear: [],
    oneYear: [],
    oneMonth: [],
    oneWeek: []
  });

  const [dailyTasks, setDailyTasks] = useState([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [currentGoalTimeframe, setCurrentGoalTimeframe] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const addGoal = (goal) => {
    setGoals(prev => ({
      ...prev,
      [goal.timeframe]: [...prev[goal.timeframe], goal]
    }));
  };

  const openGoalModal = (timeframe) => {
    setCurrentGoalTimeframe(timeframe);
    setIsGoalModalOpen(true);
  };

  const renderGoalSection = (timeframe, label) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {label}
          <Button 
            size="icon" 
            variant="outline"
            onClick={() => openGoalModal(timeframe)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {goals[timeframe].length === 0 ? (
          <p className="text-gray-500">Nessun obiettivo inserito</p>
        ) : (
          goals[timeframe].map((goal, index) => (
            <div 
              key={index} 
              className="bg-white border p-3 rounded mb-2"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">{goal.title}</h3>
                <div className="flex items-center">
                  <div 
                    className="h-2 bg-blue-200 rounded-full mr-2"
                    style={{width: '100px'}}
                  >
                    <div 
                      className="h-2 bg-blue-600 rounded-full" 
                      style={{width: `${goal.progress}%`}}
                    />
                  </div>
                  <span>{goal.progress}%</span>
                </div>
              </div>
              {goal.description && (
                <p className="text-gray-600 mb-2">{goal.description}</p>
              )}
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => {
                  setGoals(prev => ({
                    ...prev,
                    [timeframe]: prev[timeframe].filter((_, i) => i !== index)
                  }));
                }}
              >
                Rimuovi
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  // Componente per l'inserimento di attività giornaliere (mantenuto invariato dalla versione precedente)
  const DailyTaskModal = ({ isOpen, onClose, onAddTask }) => {
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskPriority, setTaskPriority] = useState('media');

    const handleAddTask = () => {
      if (taskTitle.trim()) {
        onAddTask({
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          completed: false
        });
        // Reset dei campi
        setTaskTitle('');
        setTaskDescription('');
        setTaskPriority('media');
        onClose();
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">Nuova Attività Giornaliera</h2>
          
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Titolo Attività</label>
            <Input 
              placeholder="Inserisci il titolo dell'attività"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Descrizione</label>
            <Textarea 
              placeholder="Descrivi dettagliatamente l'attività"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Priorità</label>
            <select 
              className="w-full p-2 border rounded"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
            >
              <option value="bassa">Bassa</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>Annulla</Button>
            <Button onClick={handleAddTask}>Aggiungi Attività</Button>
          </div>
        </div>
      </div>
    );
  };

  const addDailyTask = (task) => {
    setDailyTasks(prev => [...prev, task]);
  };

  return (
    <div className="flex h-screen">
      {/* Sezione Obiettivi a Lungo Termine */}
      <div className="w-1/2 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">I Tuoi Obiettivi</h2>
        {renderGoalSection('tenYear', 'Obiettivo 10 Anni')}
        {renderGoalSection('fiveYear', 'Obiettivo 5 Anni')}
        {renderGoalSection('oneYear', 'Obiettivo 1 Anno')}
        {renderGoalSection('oneMonth', 'Obiettivo 1 Mese')}
        {renderGoalSection('oneWeek', 'Obiettivo 1 Settimana')}
      </div>

      {/* Sezione Attività Giornaliere */}
      <div className="w-1/2 p-4 bg-gray-100 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Attività Giornaliere</h2>
          <Button 
            size="icon" 
            variant="outline"
            onClick={() => setIsTaskModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {dailyTasks.length === 0 ? (
          <p>Nessuna attività giornaliera al momento</p>
        ) : (
          dailyTasks.map((task, index) => (
            <div 
              key={index} 
              className="bg-white p-3 rounded mb-2"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">{task.title}</h3>
                <span 
                  className={`px-2 py-1 rounded text-xs ${
                    task.priority === 'alta' 
                      ? 'bg-red-200 text-red-800' 
                      : task.priority === 'media' 
                      ? 'bg-yellow-200 text-yellow-800' 
                      : 'bg-green-200 text-green-800'
                  }`}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{task.description}</p>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => {
                  setDailyTasks(prev => prev.filter((_, i) => i !== index));
                }}
              >
                Rimuovi
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Modal per l'inserimento di nuove attività giornaliere */}
      <DailyTaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onAddTask={addDailyTask}
      />

      {/* Modal per l'inserimento di nuovi obiettivi */}
      <GoalModal 
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onAddGoal={addGoal}
        timeframe={currentGoalTimeframe}
      />
    </div>
  );
};

export default GoalTrackingApp;
