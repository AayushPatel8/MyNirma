import React from 'react';
import { Heart, Eye, Download, Trash2, Calendar, User, Tag } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Note } from '@/types/Notes';

interface NoteCardProps {
  note: Note;
  currentUser: {
    academicYear: string;
    semester: string;
    division: string;
  };
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, currentUser }) => {
  const handleLike = () => {
    console.log('Liked note:', note.id);
    // Implement like functionality
  };

  const handleView = () => {
    console.log('Viewing note:', note.id);
    // Implement view functionality
  };

  const handleDownload = () => {
    console.log('Downloading note:', note.id);
    // Implement download functionality
  };

  const handleDelete = () => {
    console.log('Deleting note:', note.id);
    // Implement delete functionality (only for own notes)
  };

  const isOwnNote = note.uploaderName === 'Current User'; // This would be dynamic in real app

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <TooltipProvider>
      <Card className="h-full hover:shadow-md transition-shadow duration-200 border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
                {note.title}
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Badge variant="outline" className="text-xs">
                  {note.academicYear}
                </Badge>
                <span>•</span>
                <span>Div {note.division}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-3">
          {note.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {note.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <User className="h-3 w-3" />
            <span>{note.uploaderName}</span>
            <span>•</span>
            <Calendar className="h-3 w-3" />
            <span>{formatDate(note.uploadDate)}</span>
          </div>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {note.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Tag className="h-2 w-2 mr-1" />
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <Heart className="h-4 w-4" />
              <span>{note.likes}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleView}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View note details</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  className="px-3"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Like this note</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="px-3"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download note</p>
              </TooltipContent>
            </Tooltip>

            {isOwnNote && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete note</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};
