import React from 'react';

// Import integration images
import slackLanding from '../../../assets/integrations/slacklanding.png';
import zoomLanding from '../../../assets/integrations/zoomlanding.png';
import meetLanding from '../../../assets/integrations/meetlanding.png';
import hubspotLanding from '../../../assets/integrations/hubspotlanding.png';
import jiraLanding from '../../../assets/integrations/jiralanding.png';
import trelloLanding from '../../../assets/integrations/trellolanding.png';
import notionLanding from '../../../assets/integrations/notionlanding.png';
import msteamsLanding from '../../../assets/integrations/msteamslanding.png';
import clickupLanding from '../../../assets/integrations/clickuplanding.png';
import beetrixLanding from '../../../assets/integrations/beetrixlanding.png';

const Integrations: React.FC = () => {
  const tools = [
    { name: 'Slack', image: slackLanding },
    { name: 'Zoom', image: zoomLanding },
    { name: 'Google Meet', image: meetLanding },
    { name: 'HubSpot', image: hubspotLanding },
    { name: 'Jira', image: jiraLanding },
    { name: 'Trello', image: trelloLanding },
    { name: 'Notion', image: notionLanding },
    { name: 'MS Teams', image: msteamsLanding },
    { name: 'ClickUp', image: clickupLanding },
    { name: 'Beetrix', image: beetrixLanding }
  ];

  return (
    <section className="py-16 bg-black group">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-sm font-medium text-white mb-12 tracking-wider uppercase">
          INTEGRATED WITH 10+ PLATFORMS
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center justify-items-center">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="relative cursor-pointer transition-all duration-300 ease-in-out"
            >
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={tool.image}
                  alt={tool.name}
                  className="w-full h-auto max-w-[120px] opacity-50 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;