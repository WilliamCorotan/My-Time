"use client";
import { useState } from 'react';
import { useOrganizationContext } from '@/lib/contexts/organization-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Building2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrganizationSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function OrganizationSwitcher({ className, variant = 'default' }: OrganizationSwitcherProps) {
  const { currentOrganization, organizations, switchOrganization, loading, switching } = useOrganizationContext();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-4 bg-muted rounded w-24"></div>
      </div>
    );
  }

  if (!currentOrganization) {
    return null;
  }

  const handleSwitchOrganization = (orgId: string) => {
    switchOrganization(orgId);
    setIsOpen(false);
    // The page will refresh automatically, so we don't need to do anything else
  };

  if (variant === 'compact') {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => setIsOpen(!isOpen)}
          disabled={switching}
        >
          <Building2 className="h-3 w-3 mr-1" />
          {switching ? 'Switching...' : currentOrganization.name}
          {switching ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-foreground ml-1"></div>
          ) : (
            <ChevronDown className="h-3 w-3 ml-1" />
          )}
        </Button>

        {isOpen && (
          <div className="absolute top-full right-0 z-50 mt-1 min-w-[200px]">
            <Card className="shadow-lg border-border">
              <CardContent className="p-2">
                <div className="space-y-1">
                  {organizations.map((org) => (
                    <Button
                      key={org.id}
                      variant="ghost"
                      className="w-full justify-start p-2 h-auto hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleSwitchOrganization(org.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {currentOrganization.id === org.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                          <div className="text-left">
                            <div className="font-medium text-sm">{org.name}</div>
                            <div className="text-xs text-muted-foreground">
                              <Badge variant={org.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                                {org.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <div className="text-left min-w-0">
            <div className="font-medium truncate">
              {switching ? 'Switching...' : currentOrganization.name}
            </div>
            {!switching && (
              <div className="text-xs text-muted-foreground">
                <Badge variant={currentOrganization.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {currentOrganization.role}
                </Badge>
              </div>
            )}
          </div>
        </div>
        {switching ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <Card className="shadow-lg border-border">
            <CardContent className="p-2">
              <div className="space-y-1">
                {organizations.map((org) => (
                  <Button
                    key={org.id}
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleSwitchOrganization(org.id)}
                    disabled={switching}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {currentOrganization.id === org.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        <div className="text-left">
                          <div className="font-medium">{org.name}</div>
                          <div className="text-xs text-muted-foreground">
                            <Badge variant={org.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                              {org.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
