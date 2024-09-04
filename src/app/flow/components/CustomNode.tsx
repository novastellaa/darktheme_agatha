import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Home, CheckSquare, Phone, Brain, Goal, BookOpen, ScrollText, Link } from 'lucide-react';

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'Start':
      return <Home className="w-6 h-6 text-white" />;
    case 'END':
      return <Goal className="w-6 h-6 text-white" />;
    case 'telephone':
      return <Phone className="w-6 h-6 text-white" />;
    case 'Knowledge Document':
      return <ScrollText className="w-6 h-6 text-white" />;
    case 'Knowledge URL':
      return <Link className="w-6 h-6 text-white" />;
    default:
      return <Brain className="w-6 h-6 text-white" />;
  }
};

const getNodeColor = (type: string) => {
  switch (type) {
    case 'Start':
      return 'bg-blue-500';
    case 'END':
      return 'bg-orange-500';
    case 'telephone':
      return 'bg-green-500';
    case 'Knowledge Document':
      return 'bg-[#ff47bf]';
    case 'Knowledge URL':
      return 'bg-[#ff47bf]';
    default:
      return 'bg-purple-500';
  }
};

const CustomNode = ({ data }: { data: any }) => {
  const isStartOrEnd = data.nodeType === 'Start' || data.nodeType === 'END';
  const isStart = data.nodeType === 'Start';
  const isEnd = data.nodeType === 'END';

  return (
    <div className={`px-4 py-2 shadow-lg rounded-3xl bg-[#2F2F2F] w-[27vw]`}>
      <div className="flex items-center min-h-[9vh] my-1">
        <div>

          <div className={`w-11 h-11 rounded-full ${getNodeColor(data.nodeType)} flex items-center justify-center mr-2 shadow-md`}>
            {getNodeIcon(data.nodeType)}
          </div>
        </div>
        <div className="ml-2 flex-grow">
          <div className="text-xl font-bold">{data.label}</div>
          {!isStartOrEnd && <div className="text-gray-500">{data.description || data.nodeType}</div>}
          {data.content && (
            <div className="mt-2 text-sm text-gray-600 break-words">
              {data.content}
            </div>
          )}
        </div>
      </div>

      {!isStart && <Handle type="target"  position={Position.Left} className="w-[15px] h-[15px] !bg-teal-500 shadow-sm" />}
      {!isEnd && <Handle type="source" position={Position.Right} className="w-[15px] h-[15px] !bg-teal-500 shadow-sm" />}
    </div>
  );
};

export default memo(CustomNode);