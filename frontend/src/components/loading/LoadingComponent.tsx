import {CircularProgress} from '@mui/material';
import ContentCard from '../ContentCard.tsx';

export default function LoadingComponent() {
  return (
    <ContentCard>
      <div className="flex justify-center">
        <CircularProgress aria-label="Loading…"/>
      </div>
    </ContentCard>
  )
}